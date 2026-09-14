FROM node:20

WORKDIR /usr/src/node-app

# Install dependencies first (better layer caching)
COPY package.json yarn.lock ./

RUN yarn install --pure-lockfile

# Copy rest of project
COPY . .

EXPOSE 5002

CMD ["yarn", "start"]
