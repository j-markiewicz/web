FROM node:26

WORKDIR /server/

COPY . .

RUN npm install
RUN npm run build

ENV PORT=8000
EXPOSE 8000

CMD [ "node", "/server/build/src/main.js" ]
