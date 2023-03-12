FROM node:alpine

# Create app directory
WORKDIR /usr/src/app/server

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY ./server/package*.json ./

RUN yarn install
# If you are building your code for production
# RUN npm ci --only=production

# Bundle app source
COPY ./server .

EXPOSE 5000

CMD [ "yarn", "start" ]
