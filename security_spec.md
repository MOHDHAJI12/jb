# Security Specification for JB Fruits

## Data Invariants
1. A product must have a name, price, and image.
2. An order must contain at least one item and a valid total.
3. Blog posts can only be modified by administrators.

## Dirty Dozen Payloads
1. **Unauthorized Product Edit**: Anonymous user tries to update a product name.
2. **Product Shadow Field**: Admin tries to add `isSecret: true` to a product.
3. **Invalid Price Type**: Setting product price to a number instead of string `$12.00`.
4. **Order Without Items**: Creating an order with `items: []`.
5. **Order Total Mismatch**: Creating an order where the total is negative.
6. **Unauthorized Order Read**: Anonymous user tries to list all orders.
7. **Blog Post Deletion**: Anonymous user tries to delete a blog post.
8. **Malicious ID Injection**: Product ID contains special characters like `../`.
9. **Identity Spoofing**: User tries to set themselves as an admin in a product update.
10. **Shadow Order Field**: Adding `isPaid: true` to a new order.
11. **Huge ID**: Trying to use a 2KB string as a product ID.
12. **System Field Hijack**: User tries to manually set `createdAt` instead of using server timestamp (though here it's currently a string).

## Test Cases (Expected Result: PERMISSION_DENIED)
- Any write to `products` or `blogs` without `isAdmin()` role.
- Any read from `orders` without `isAdmin()` role.
- Creation of an order with missing required fields.
