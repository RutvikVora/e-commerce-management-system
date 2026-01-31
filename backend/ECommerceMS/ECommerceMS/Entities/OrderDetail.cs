using System;
using System.Collections.Generic;

namespace ECommerceMS.Entities;

public partial class OrderDetail
{
    public int OrderId { get; set; }

    public int? ProductId { get; set; }

    public int Quantity { get; set; }

    public decimal? TotalPrice { get; set; }

    public DateTime OrderDate { get; set; }

    public DateTime CreatedDate { get; set; }

    public DateTime UpdatedDate { get; set; }

    public virtual ProductDetail? Product { get; set; }
}
