# Gunakan Node.js versi 20 berbasis Alpine
FROM node:20-alpine

# Menetapkan direktori kerja di dalam kontainer.
WORKDIR /app

# Install dependencies using package-lock.json when available for reproducible builds
COPY package*.json ./
COPY package-lock.json ./

# Meng-install semua dependensi yang dibutuhkan
RUN npm install

# Menyalin seluruh source code proyek
COPY . .

# Mengekspos port yang digunakan oleh Vite.
EXPOSE 5173

# Perintah untuk menjalankan aplikasi saat kontainer dijalankan.
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]