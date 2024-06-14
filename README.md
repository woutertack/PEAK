# PEAK
Peak is a school project designed to motivate young adults to walk more and adopt a healthier lifestyle. The app features an interactive map with challenges, gamification elements like streaks and rewards, and social competitions. Users can track their progress, set goals, and challenge friends, making daily walks fun and engaging.

## Build with
- React Native
- Expo (EAS)
- Supabase
- Health Connect
- Mapbox + h3

## Installation
1. Clone the repository
2. Install the dependencies 'npm install'
3. Create Supabase account and set up a new project with the following tables:

### Database Table: `profiles`

| Column             | Type                       | Description                           |
|--------------------|----------------------------|---------------------------------------|
| `id`               | `uuid`                     | Unique identifier for each profile.   |
| `updated_at`       | `timestamp with time zone` | Last update timestamp of the profile. |
| `first_name`       | `text`                     | User's first name.                    |
| `last_name`        | `text`                     | User's last name.                     |
| `avatar_url`       | `text`                     | URL to the user's avatar image.       |
| `first_login`      | `boolean`                  | Indicates if it's the user's first login. |
| `level`            | `text`                     | User's current level.                 |
| `created_at`       | `timestamp with time zone` | Creation timestamp of the profile.    |
| `total_steps`      | `bigint`                   | Total number of steps taken by the user. |
| `total_distance_km`| `double precision`         | Total distance walked in kilometers.  |
| `total_hexagons`   | `real`                     | Total hexagons captured by the user.  |
| `total_visits`     | `real`                     | Total visits made by the user.        |
| `expo_push_token`  | `text`                     | Expo push token for notifications.    |





## Created by
Wouter Tack - Artevelde University
