using CustomerReviews.Core.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace CustomerReviews.Web.Converters
{
    public static class CustomerReviewConverter
    {
        public static CustomerReview ToWebModel(this CustomerReview customerReview, bool convertProps = true)
        {
            var retVal = new CustomerReview
            {
                Id = customerReview.Id,
                Content = customerReview.Content,
                AuthorNickname = customerReview.AuthorNickname,
                ProductId = customerReview.ProductId,
                ProductTitle = customerReview.ProductTitle,
            };
            return retVal;
        }
    }
}