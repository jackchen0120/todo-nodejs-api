FROM node:10.12.0
COPY ./ /app
WORKDIR /app
# RUN npm install
EXPOSE 8088
CMD npm run start