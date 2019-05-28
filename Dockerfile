FROM node:10-alpine

WORKDIR /var/www/cache

COPY package.json .
RUN npm install --quiet

COPY . . 

CMD ["npm", "test"]