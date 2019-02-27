using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using VirtoCommerce.Platform.Core.Security;

namespace CustomerReviews.Web.Controllers.Api
{
    public class CustomerReviewsBaseController : ApiController
    {
        private readonly ISecurityService _securityService;
        private readonly IPermissionScopeService _permissionScopeService;

        public CustomerReviewsBaseController(ISecurityService securityService, IPermissionScopeService permissionScopeService)
        {
            _securityService = securityService;
            _permissionScopeService = permissionScopeService;
        }

        protected string[] GetObjectPermissionScopeStrings(object obj)
        {
            return _permissionScopeService.GetObjectPermissionScopeStrings(obj).ToArray();
        }

        protected void CheckCurrentUserHasPermissionForObjects(string permission, params object[] objects)
        {
            //Scope bound security check
            var scopes = objects.SelectMany(x => _permissionScopeService.GetObjectPermissionScopeStrings(x)).Distinct().ToArray();
            if (!_securityService.UserHasAnyPermission(User.Identity.Name, scopes, permission))
            {
                throw new HttpResponseException(HttpStatusCode.Unauthorized);
            }
        }

    }
}
