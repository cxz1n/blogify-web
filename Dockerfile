FROM node:16.16 as builder
WORKDIR /

ADD package.json package-lock.json /
RUN npm install  --registry https://registry.npm.taobao.org

ADD . /
RUN npm run build

FROM nginx:alpine
COPY nginx.conf /etc/nginx
COPY --from=builder /dist /usr/share/nginx/html/
EXPOSE 8888
CMD [ "nginx", "-g", "daemon off;" ]