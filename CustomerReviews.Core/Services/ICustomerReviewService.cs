using CustomerReviews.Core.Model;

namespace CustomerReviews.Core.Services
{
    public interface ICustomerReviewService
    {
        CustomerReview[] GetByIds(string[] ids);

        void SaveCustomerReviews(CustomerReview[] items);
        void SaveCustomerReview(CustomerReview item);
        void DeleteCustomerReviews(string[] ids);
        CustomerReview GetById(string id);
    }
}
