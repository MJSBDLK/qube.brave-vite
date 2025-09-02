# Use lightweight nginx Alpine for serving static files
FROM nginx:alpine

# Copy pre-built application to nginx html directory
COPY out/ /usr/share/nginx/html/

# Expose port
EXPOSE 80

# nginx starts automatically in Alpine image
