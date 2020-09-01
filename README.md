## Inspiration
We were inspired by how one of our team members already uses Monday to reward their staff by placing monetary rewards on completed items. So we thought... what if we could take it a step further and make a fun, addictive game out of it? That's when Jackpot was born.

##What it does
Jackpot app can be added to any board. It will read the board's Person and Status columns to determine which items are "complete", and then to add money to a jackpot for each item. Users can then spin the wheel for a number of times equal to how many items they have personally completed. The more spins, the more chances to win.

## How we built it
We made a standalone React app and exported the build into Monday, so it can be added to any board, and doesn't rely on a backend other than a Monday board. We started with the example app, so we used React + ngrok for development, and made use of Monday's APIs.

## Challenges we ran into
Since it was only possible to develop the app from within the Build view inside of Monday, we couldn't use typical React developer tools, from what we could tell, so we had to rely mostly on console.log's. Also, we just met as a team and had to work remotely on this project, so that was a challenging new experience.

## Accomplishments that we're proud of
This is the first React app anyone on our team has ever made, so we had to learn React on the fly. This is also the first time we made use of Monday's APIs, such as storage, board data, context, settings, notices, so learning those was fun.

## What we learned
We learned React! Also how to make a an app using the Monday platform, and how to use the Monday APIs, such as storage, me, boards, context, settings, notices. And how to work remotely with a team of people we just met.

## What's next for Jackpot
Jackpot can certainly be spruced up to include instructions for new users, as well as alert integrations through Monday to email or slack whenever someone wins a jackpot.

## Run the project

In the project directory, you should run:

### `npm install`

And then to run an application with automatic virtual ngrok tunnel, run:

### `npm start`

Visit http://localhost:4040/status and under "command_line section" find the URL. This is the public URL of your app, so you can use it to test it.
F.e.: https://021eb6330099.ngrok.io

## Configure Monday App 

1. Open monday.com, login to your account and go to a "Developers" section.
2. Create a new "QuickStart View Example App"
3. Open "OAuth & Permissions" section and add "boards:read" scope
4. Open "Features" section and create a new "Boards View" feature
5. Open "View setup" tab and fulfill in "Custom URL" field your ngrok public URL, which you got previously (f.e. https://021eb6330099.ngrok.io)
6. Click "Boards" button and choose one of the boards with some data in it.
7. Click "Preview button"
8. Enjoy the Quickstart View Example app!

## Release your app
1. Run script
### `npm run build`
2. Zip your "./build" folder
3. Open "Build" tab in your Feature
4. Click "New Build" button
5. Click "Upload" radio button and upload zip file with your build
6. Go to any board and add your just released view
7. Enjoy!
