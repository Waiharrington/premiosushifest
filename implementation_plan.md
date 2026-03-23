# [COMPLETED] Sushifest Implementation Plan

Build a new platform for "Sushifest" based on the established "Salchipapa Fest" structure, adding user sessions, multi-category ratings, and a coupon redemption system.

## Proposed Changes (All Implemented)

### [Component 1] Public Rating & Private Voting
Modify the core logic to separate "Ranking" (public stars) from "Voting" (private count).

#### [DONE] Database Schema (Supabase)
- **`profiles`**: Store user data (Cedula, Phone, Name). Cedula ensures one account per person.
- **`ratings`**: Store 1-5 star ratings for Flavor, Service, and Presentation per restaurant.
- **`votes`**: Store the actual "Winner" votes (1 per restaurant per user).
- **`locales`**: Participating restaurants (image, name, description).

#### [DONE] UI/UX
- **User Registration**: Simple form asking for Name, Cedula, and Phone. Session persists.
- **Restaurant Card**: Shows 5 stars for rating + 3 specific categories (Flavor, Service, Presentation).
- **Voting Button**: "Dar mi voto" (Give my vote) button distinct from rankings.
- **Ranking Page**: Displays leaderboards based on star averages. Actual vote counts are hidden from the public.

---

### [Component 2] Gift Card & Coupon System (Beta)
A "surprise" reward system to drive engagement.

#### [DONE] Coupon Logic
- **Coupon Generation**: A set of unique codes that can be printed on physical tickets.
- **Claim Flow**: User scans QR -> Registers -> Claims a "Surprise Sushi".
- **Redemption**:
    - User goes to the restaurant.
    - App generates a one-time use code.
    - **Restaurant Dashboard**: A special UI for restaurants to scan and "burn" the coupon.

---

### [Component 3] Project Setup (Mirroring Salchipapa)
- Create a new directory `sushifest` mirroring the `salchipapa-fest` structure. [DONE]
- Initialize a new Supabase project or new tables in the existing one. [DONE]
- Configure Supabase Storage `locales` bucket (Public) and authorize domain in `next.config.ts`. [DONE]
- Refactor admin actions to use `service_role` to bypass RLS for administrative tasks. [DONE]

## Verification Plan

### Automated Tests
- Script to simulate user registration with Cedula and verify uniqueness.
- Script to simulate rating/voting and check if public ranking updates correctly while votes remain private.

### Manual Verification
- **User Flow**: Register -> Rate a restaurant -> Vote for it -> Check if session persists.
- **Coupon Flow**: Register -> Claim coupon -> Show "Redeem" screen -> Verify redemption by "Restaurant User".
- **Visual Check**: Ensure the design feels "Premium" and aligned with EpicMarketing standards.
