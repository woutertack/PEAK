# PEAK
Peak is a school project designed to motivate young adults to walk more and adopt a healthier lifestyle. The app features an interactive map with challenges, gamification elements like streaks and rewards, and social competitions. Users can track their progress, set goals, and challenge friends, making daily walks fun and engaging.

![Group 199](https://github.com/user-attachments/assets/16032c87-a14a-49fd-974b-871b19f0b6e1)

## Build with
- React Native
- Expo (EAS)
- Supabase
- Health Connect
- Mapbox + h3

## Installation
1. Clone the repository
2. Install the dependencies 'npm install'
3. Create Supabase account and set up a new project with the following tables below
4. Create mapbox api token
5. Create a .env file in the root of the project and add the environment variables
6. Make new project in expo and add your id and package credentials to app.json
7. Create a eas.json file and also add the environment variables in here 
8. Build the app with 'eas build --profile development --platform android' or 'eas build --profile preview --platform android'
9. Scan qr or run on emulator (If build for preview run with 'npx expo start')

(This project does not work on Expo Go)

## Design
![Startscreen slider 1 – 3](https://github.com/user-attachments/assets/40c03111-76ff-448b-88a0-fd4a5f7442be) ![First login](https://github.com/user-attachments/assets/08aeb6d3-3c75-45fc-8ff6-8b8156d4e65a) ![Map-home](https://github.com/user-attachments/assets/9754fa04-ec84-49e1-a231-0f8e1eccfc46)
![Streak screen](https://github.com/user-attachments/assets/098bea21-5dc3-4052-b10a-e45069fb3251) ![Profile](https://github.com/user-attachments/assets/6ff640ee-b154-4a58-8ea5-67e55567896c) ![Challenges-badges – 2](https://github.com/user-attachments/assets/5a8d634d-edc9-4ac0-ba75-811452017d29)




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
| `tutorial_seen`  | `boolean`                     | Check if they have seen tutorial.    |


### Database Table: `challenges`

| Column            | Type                       | Description                           |
|-------------------|----------------------------|---------------------------------------|
| `id`              | `uuid`                     | Unique identifier for each location.  |
| `user_id`         | `uuid`                     | Unique identifier for the user.       |
| `type`            | `text`                     | Type of location.                     |
| `challenge_type`  | `text`                     | Type of challenge at the location.    |
| `goal`            | `integer`                  | Goal associated with the location.    |
| `creation_time`   | `timestamp with time zone` | Creation timestamp of the location.   |
| `completed`       | `boolean`                  | Indicates if the goal was completed.  |

### Database Table: `locations`

| Column            | Type                       | 
|-------------------|----------------------------|
| `id`              | `integer`                  | 
| `hex_index`         | `text`                     | 
| `visited_at`            | `timestampz`                     | 
| `user_id`  | `uuid`                     | 
| `visits`            | `integer`                  | 
| `visit_times`   | `timestamp with time zone` | 

### Database Table: `versus`

| Column            | Type                       | 
|-------------------|----------------------------|
| `id`              | `integer`                  | 
| `creator_id`         | `uuid`                     | 
| `friend_id`            | `uuid`                     | 
| `challenge-type`  | `text`                     | 
| `goal`            | `integer`                  | 
| `creation_time`   | `timestamp with time zone` | 
| `completed`              | `boolean`                  | 
| `creator_progress`         | `integer`                     | 
| `friend_progress`            | `integer`                     | 
| `winner`  | `uuid`                     | 
| `status`            | `text`                  | 
| `deadline`   | `timestamp with time zone` | 
| `accepted_time`            | `timestamp with time zone`                  | 


### Database Table: `friend_requests`

| Column            | Type                       | 
|-------------------|----------------------------|
| `id`              | `uuid`                  | 
| `requester_id`         | `uuid`                     | 
| `requestee_id`            | `uuid`                     | 
| `status`  | `text`                     | 
| `created_at`            | `timestamp with time zone`                  | 
| `updated_at`   | `timestamp with time zone` | 





## Created by
Wouter Tack - Artevelde University
