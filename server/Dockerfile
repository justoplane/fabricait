FROM node:22.13.1-alpine
WORKDIR /app
COPY ./package.json .
COPY ./package-lock.json .
RUN npm install
COPY . .


# Install required packages and OpenSCAD
RUN apk update && \
    apk add --no-cache openscad

EXPOSE 3000

# the program we want to run!
CMD ["npm", "run", "dev"]
