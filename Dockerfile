FROM node:alpine3.10 

ARG file=dist/main.js
EXPOSE 8081 
WORKDIR /app 

COPY $file .

CMD [ "node", $file ]