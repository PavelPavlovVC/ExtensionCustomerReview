using System;
using System.Collections.Generic;
using System.Linq;
using CacheManager.Core;
using CustomerReviews.Core.Model;
using CustomerReviews.Core.Services;
using CustomerReviews.Data.Model;
using CustomerReviews.Data.Repositories;
using VirtoCommerce.Platform.Core.Common;
using VirtoCommerce.Platform.Data.Infrastructure;
using VirtoCommerce.Platform.Data.Common;

namespace CustomerReviews.Data.Services
{
    public class CustomerReviewService : ServiceBase, ICustomerReviewService
    {
        private readonly ICacheManager<object> _cacheManager;
        private readonly Func<ICustomerReviewRepository> _repositoryFactory;

        public CustomerReviewService(Func<ICustomerReviewRepository> repositoryFactory, ICacheManager<object> cacheManager)
        {
            _repositoryFactory = repositoryFactory;
            _cacheManager = cacheManager;
        }

        public CustomerReview GetById(string id)
        {
            // TODO: need research using _cashManager from CatalogModule
            //CustomerReview result;
            //if (PreloadCustomerReviews().TryGetValue(catalogId, out result))
            //{
            //    //Clone required because client code may change resulting objects
            //    result = MemberwiseCloneCustomerReview(result);
            //}
            //return result;
            using (var repository = _repositoryFactory())
            {
                return repository.GetById(id).ToModel(AbstractTypeFactory<CustomerReview>.TryCreateInstance());
            }
        }

        public CustomerReview[] GetByIds(string[] ids)
        {
            using (var repository = _repositoryFactory())
            {
                return repository.GetByIds(ids).Select(x => x.ToModel(AbstractTypeFactory<CustomerReview>.TryCreateInstance())).ToArray();
            }
        }

        public void SaveCustomerReviews(CustomerReview[] items)
        {
            if (items == null)
                throw new ArgumentNullException(nameof(items));

            var pkMap = new PrimaryKeyResolvingMap();
            using (var repository = _repositoryFactory())
            {
                using (var changeTracker = GetChangeTracker(repository))
                {
                    var alreadyExistEntities = repository.GetByIds(items.Where(m => !m.IsTransient()).Select(x => x.Id).ToArray());
                    foreach (var derivativeContract in items)
                    {
                        var sourceEntity = AbstractTypeFactory<CustomerReviewEntity>.TryCreateInstance().FromModel(derivativeContract, pkMap);
                        var targetEntity = alreadyExistEntities.FirstOrDefault(x => x.Id == sourceEntity.Id);
                        if (targetEntity != null)
                        {
                            changeTracker.Attach(targetEntity);
                            sourceEntity.Patch(targetEntity);
                        }
                        else
                        {
                            repository.Add(sourceEntity);
                        }
                    }

                    CommitChanges(repository);
                    pkMap.ResolvePrimaryKeys();
                }
            }
        }

        public void SaveCustomerReview(CustomerReview item)
        {
            if (item == null)
                throw new ArgumentNullException(nameof(item));

            var pkMap = new PrimaryKeyResolvingMap();
            using (var repository = _repositoryFactory())
            {
                using (var changeTracker = GetChangeTracker(repository))
                {
                    var alreadyExistEntities = repository.GetById(item.Id);
                    //foreach (var derivativeContract in item)
                    {
                        var sourceEntity = AbstractTypeFactory<CustomerReviewEntity>.TryCreateInstance().FromModel(item, pkMap);
                        var targetEntity = alreadyExistEntities;
                        if (targetEntity != null)
                        {
                            changeTracker.Attach(targetEntity);
                            sourceEntity.Patch(targetEntity);
                        }
                        else
                        {
                            repository.Add(sourceEntity);
                        }
                    }

                    CommitChanges(repository);
                    pkMap.ResolvePrimaryKeys();
                }
            }
        }

        public void DeleteCustomerReviews(string[] ids)
        {
            using (var repository = _repositoryFactory())
            {
                repository.DeleteCustomerReviews(ids);
                CommitChanges(repository);
            }
        }

        protected virtual CustomerReview MemberwiseCloneCustomerReview(CustomerReview customerReview)
        {
            var retVal = AbstractTypeFactory<CustomerReview>.TryCreateInstance();

            retVal.Id = customerReview.Id;
            retVal.AuthorNickname= customerReview.AuthorNickname;
            retVal.Content = customerReview.Content;
            retVal.ProductId = customerReview.ProductId;
            retVal.ProductTitle = customerReview.ProductTitle;
            return retVal;
        }

        // TODO: need research implementation from CatalogModule
        protected virtual Dictionary<string, CustomerReview> PreloadCustomerReviews()
        {
            
            return _cacheManager.Get("AllCustomerReviews", CustomerReviewConstants.CacheRegion, () =>
            {
                CustomerReviewEntity[] entities;
                using (var repository = _repositoryFactory())
                {
                    //Optimize performance and CPU usage
                    // TODO: need research DisableChangesTracking
                    //repository.DisableChangesTracking();

                    entities = repository.GetByIds(repository.CustomerReviews.Select(x => x.Id).ToArray());
                }

                var result = entities.Select(x => x.ToModel(AbstractTypeFactory<CustomerReview>.TryCreateInstance())).ToDictionary(x => x.Id, StringComparer.OrdinalIgnoreCase);

                //LoadDependencies(result.Values, result);
                return result;
            });
        }
    }
}
