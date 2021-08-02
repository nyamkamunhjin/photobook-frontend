FROM mhart/alpine-node:14 as builder
WORKDIR /app/node/react
COPY package*.json ./

# RUN apk --no-cache add --virtual native-deps \
#   g++ gcc libgcc libstdc++ linux-headers make python && \
#   npm install --quiet node-gyp -g &&\
#   npm install --quiet && \
#   apk del native-deps

# ENV NODE_ENV=production
ENV REACT_APP_BACK_URL=https://photobook.fibo.cloud:8443/api/v1
ENV REACT_APP_PUBLIC_IMAGE=https://dev-photobook-infra-s3-files6f97a25d-qdr2q0v0swq5.s3.amazonaws.com/public/

RUN yarn
COPY . .

RUN yarn build

# production environment
FROM nginx:stable-alpine
COPY --from=builder /app/node/react/build /usr/share/nginx/html
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
