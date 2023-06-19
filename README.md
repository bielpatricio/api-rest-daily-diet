<div id="top"></div>

<!-- PROJECT LOGO -->

<br />
<div align="center">
  <h1 align="center">Daily Diet api</h3>
</div>

<!-- TABLE OF CONTENTS -->

## Contents

<p align="center">
    <p><a href="#about-the-project" title=" go to About the Project">About The Project</a></p>
    <p><a href="#running-locally" title=" go to Running locally">Running locally</a></p>
    <p><a href="#routes" title=" go to Routes">Routes</a></p>
    <p><a href="#contact" title=" go to Contact">Contact</a></p>
  </p>

<br>
<!-- ABOUT THE PROJECT -->

# About The Project

Daily Diet api, challenge 2 from ignite nodeJS from rocketseat. 

## Roules
### Application Rules

- It should be possible to create a user
- It must be possible to identify the user among the requests
- It must be possible to register a meal made, with the following information:
    
    *Meals must be related to a user.*
    
    - Name
    - Description
    - Date and time
    - Is on or off the diet
- It must be possible to edit a meal, being able to change all the above data
- It must be possible to delete a meal
- It should be possible to list all meals of a user
- It should be possible to visualize a single meal
- It should be possible to retrieve a user's metrics
    - Total number of registered meals
    - Total amount of meals within the diet
    - Total number of meals outside the diet
    - Better sequence of meals within the diet
- User can only view, edit and delete meals which he created

### The roules about the challenge can be checked here [challenge](https://efficient-sloth-d85.notion.site/Desafio-02-be7cdb37aaf74ba898bc6336427fa410)

![image](https://github.com/bielpatricio/api-rest-daily-diet/assets/32223762/415a0a0c-feb0-4a09-8bc3-8599291418fb)

<br>

# Running locally

```bash
# Clone this repository
$ git clone https://github.com/bielpatricio/api-rest-daily-diet
# Access the project folder in your terminal
$ cd api-rest-daily-diet
# Install the dependencies
$ npm i
# Run the application in development mode
$ npm run dev
# The application will runing on port 3333, so you can access the url http://localhost:3333/ to do the requests.
# Run the tests
$ npm test
```

# Routes

For the project, some routes were created:

## User
```
  1. Create a user
    (POST) http://localhost:3333/users
    1.1 body
      {
          "username": "bieu",
          "email": "bieu@gmail.com",
          "password": "123",
          "confirmPassword": "123"
      }

  2. Login a user
    (PUT) http://localhost:3333/users/login
    2.1 body
      {
          "username": "bieu",
          "password": "123"
      }

  3. Get a user
    (GET) http://localhost:3333/users

    response example:

      {
          "total": 5,
          "totalInDiet": 4,
          "totalOutDiet": 1,
          "BestSequence": 3,
          "user": {
              "id": "ffa20cb0-a010-4aae-976a-91070cb779b6",
              "username": "bieu",
              "email": "bieu@gmail.com",
              "password": "123",
              "created_at": "2023-06-19 17:14:55",
              "updated_at": "2023-06-19 17:47:51",
              "session_id": "93d3e512-32be-45ae-b055-7e704ff2ce13"
          }
      }

  4. Delete a user
    (DELETE) http://localhost:3333/users/:id
```

## Meal
```
  1. Create a meal
    (POST) http://localhost:3333/meals
    1.1 body
      {
          "username": "bieu",
          "email": "bieu@gmail.com",
          "password": "123",
          "confirmPassword": "123"
      }

  2. Put a meal
    (PUT) http://localhost:3333/meals/:id
    2.1 body
      {
          "name": "Cafe",
          "description": "ovos e mamão",
          "inDiet": true,
          "date": "{{currentdate}}"
      }

  3. Get a meal by id
    (GET) http://localhost:3333/meals/:id

    response example:

      {
          "id": "84ceba1d-ebc8-4508-9507-6efcbf490544",
          "session_id": "93d3e512-32be-45ae-b055-7e704ff2ce13",
          "name": "Cafe",
          "description": "ovos e mamão",
          "date": "2023-06-19T15:42:11-03:00",
          "inDiet": 1,
          "created_at": "2023-06-19 17:15:12",
          "updated_at": "2023-06-19 18:42:11"
      }

  4. Get all meals
      (GET) http://localhost:3333/meals
  
      response example:
  
        {
            "total": 2,
            "meals": [
                {
                    "id": "84ceba1d-ebc8-4508-9507-6efcbf490544",
                    "session_id": "93d3e512-32be-45ae-b055-7e704ff2ce13",
                    "name": "Cafe",
                    "description": "ovos e mamão",
                    "date": "2023-06-19T15:42:11-03:00",
                    "inDiet": 1,
                    "created_at": "2023-06-19 17:15:12",
                    "updated_at": "2023-06-19 18:42:11"
                },
                {
                    "id": "8323b7c9-4c7a-4871-97ce-614239d96b79",
                    "session_id": "93d3e512-32be-45ae-b055-7e704ff2ce13",
                    "name": "janta",
                    "description": "ovo com cuscuz",
                    "date": "2023-06-19T14:15:21-03:00",
                    "inDiet": 1,
                    "created_at": "2023-06-19 17:15:21",
                    "updated_at": "2023-06-19 17:47:51"
                },
            ]
        }


  5. Delete a meal
    (DELETE) http://localhost:3333/meals/:id
```
   
# Contact

Gabriel Patrício - gabrieltp087@gmail.com - [https://github.com/bielpatricio/](https://github.com/bielpatricio)

<p align="right">(<a href="#top">back to top</a>)</p>
