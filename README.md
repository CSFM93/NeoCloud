# Neo cloud

[Demo](https://www.youtube.com/watch?v=2c2V26Pjhh4)

## Inspiration
I always wanted to use the power of the blockchain to build something and this hackathon allowed me to do so.

## What it does
Neo cloud is an Imgur clone powered by NeoFS and Neo smart contracts. The platform allows users to see, create, and share posts containing images, videos, and gifs. The front-end code was deployed to NeoFs and in the backend, we are using a Neo smart contract to store and retrieve this platform's data and a docker container to interact with NeoFs.

Anyone with a computer and an internet connection can access the platform, however, users who have used their Neo account to connect to the platform can do more things than users who haven't.

Users who haven't used their Neo account to connect to the platform can only do the following:
- See all posts on the main page;
- See a specific post;
- Copy the URL of the post's media file;
- Search for posts by using a keyword;
- Search for a specific user's posts;

Users who have used their Neo account to connect to the platform can everything that the other type of user can plus the following:
- Create a profile and edit it;
- Change the username and profile image;
- Create a post;
- Edit a post title;
- Delete a post;

Before connecting to Neo cloud using your Neo account, you need to create and run a container with the docker image that I made for this project:

```bash
docker run -d -p 3021:3021 csfm1993/neofs-cli 
```

You need to run the container on the port `3021` on your local machine because that's what the Neo cloud platform is expecting. After starting the container you can use your Neo account WIF to connect to the Neo cloud.

## How we built it
This project consists of 3 components : a smart contract , an app running on a docker container, and a frontend application

### Smart contract <a name="smartContract"></a>
The smart contract was written using C#, and it is responsible for storing in its private storage the Neo cloud platform data. Inside this smart contract, we have created two tables, one named users and the other named posts, and we also implemented the methods responsible for performing CRUD operations. The smartcontract hash is : `0xefeb7fa101996240a35a88f388407f0027ce02e4`

Here is the schema of both tables:

![](https://i.imgur.com/oqloqlj.png)

When I implemented this smart contract I made sure that each user is only allowed to modify his profile and own posts by checking the address of the person who invoked the contract before changing the data. 

### Docker container <a name="container"></a>
Inside the container, there is a node.js application built with express that wraps the NeoFs CLI. This application is responsible for creating a public container in NeoFs and uploading files to the container. 



###  Frontend <a name="frontend"></a>
For the design, I used HTML, CSS, and Bootstrap. For the business logic, I used Javascript  NeonJs and Axios. I used NeonJs to interact with the Neo cloud smart contract and Axios to interact with the Neofs CLI inside the docker container.

## Challenges we ran into
At the beginning of the hackathon I wanted to write the smart contracts using python because that's my go-to language when I need to build something fast, however, I soon found out that I wouldn't be able to do what I wanted to do with python because the libraries aren't there yet since Neo3 is quite new. So after that, I did some research and realized that I would be able to do what I wanted if used c# to write smart contracts, even though I don't have much experience with c# I decided to give it a go, and fortunately, it worked.
In order to get familiar with how the Neofs works, I decided to follow a tutorial teaching how to upload files to the NeoFs was published to the NeoFs's page on Medium but when I tried to follow the tutorial the latest released version of the NeoFs CLI wasn't compatible with the tutorial and at the time it wasn't clear what the problem was, but fortunately I had help from the Neo's developers server on discord and I was able to follow the tutorial.


## Accomplishments that we're proud of
I am proud that I was able to build my first decentralized application after wanting to do so for so long.

## What we learned
While building the Neo cloud platform I had to learn the following:
- How to use the Neo cli, NeoFs cli, and Neogo cli;
- How to write and update smart contracts using c# ;
- How to perform CRUD operations on a smart contract private storage;
- How to film, and edit a project video demo.

## What's next for Imgur clone powered by NeoFS
In the long term, I plan to write a detailed tutorial teaching people how to build the entire project.

