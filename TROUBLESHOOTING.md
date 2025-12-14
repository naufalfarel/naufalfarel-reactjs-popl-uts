# Troubleshooting Logging Stack

## Masalah: "Unable to connect with Loki" di Grafana

### Solusi 1: Restart Services

```bash
# Stop semua services
docker-compose down

# Start ulang services
docker-compose up -d

# Tunggu beberapa detik untuk Loki siap
sleep 10

# Cek status containers
docker-compose ps
```

### Solusi 2: Verifikasi Loki Berjalan

```bash
# Cek apakah Loki container running
docker ps | grep loki

# Cek log Loki untuk error
docker logs loki

# Test koneksi ke Loki dari host
curl http://localhost:3100/ready
curl http://localhost:3100/metrics
```

### Solusi 3: Verifikasi Network

```bash
# Cek apakah containers dalam network yang sama
docker network inspect naufalfarel-reactjs-popl-uts_logging-network

# Test koneksi dari Grafana container ke Loki
docker exec grafana wget -O- http://loki:3100/ready
```

### Solusi 4: Periksa Konfigurasi Data Source

1. Buka Grafana: http://localhost:3000
2. Masuk dengan admin/admin
3. Buka **Configuration** → **Data Sources**
4. Klik **Loki**
5. Pastikan URL: `http://loki:3100`
6. Klik **Save & Test**

### Solusi 5: Reset Grafana Data Source

Jika masih tidak berhasil, hapus dan buat ulang data source:

1. Di Grafana, buka **Configuration** → **Data Sources**
2. Klik **Loki** → **Delete**
3. Klik **Add data source** → Pilih **Loki**
4. URL: `http://loki:3100`
5. Klik **Save & Test**

### Solusi 6: Cek Health Check Loki

```bash
# Cek health status
docker inspect loki | grep -A 10 Health

# Atau langsung test
docker exec loki wget -q -O- http://localhost:3100/ready
```

### Solusi 7: Rebuild Containers

```bash
# Stop dan hapus containers
docker-compose down

# Hapus volumes (opsional, akan menghapus data)
docker-compose down -v

# Build ulang dan start
docker-compose up -d --force-recreate
```

## Masalah: Promtail tidak mengirim logs

### Verifikasi Promtail

```bash
# Cek log Promtail
docker logs promtail

# Cek apakah file log ada
ls -la backend/logs/

# Test koneksi Promtail ke Loki
docker exec promtail wget -O- http://loki:3100/ready
```

### Pastikan File Log Ada

```bash
# Buat direktori logs jika belum ada
mkdir -p backend/logs

# Pastikan file log ada dan bisa dibaca
touch backend/logs/app.log
chmod 644 backend/logs/app.log
```

## Masalah: Logs tidak muncul di Grafana

### Cek Query di Grafana

1. Buka **Explore** di Grafana
2. Pilih data source **Loki**
3. Gunakan query: `{job="backend"}`
4. Pastikan time range sudah benar (misalnya: Last 15 minutes)

### Verifikasi Logs Dikirim ke Loki

```bash
# Cek log Promtail untuk melihat apakah ada error
docker logs promtail | grep -i error

# Test query langsung ke Loki API
curl -G -s "http://localhost:3100/loki/api/v1/query_range" \
  --data-urlencode 'query={job="backend"}' \
  --data-urlencode 'limit=10' | jq
```

## Masalah: Permission Denied pada Log Files

### Fix Permissions

```bash
# Set permissions untuk logs directory
chmod -R 755 backend/logs
chmod 644 backend/logs/*.log
```

## Debugging Commands

### Cek Semua Container Status
```bash
docker-compose ps
```

### Cek Logs Semua Services
```bash
docker-compose logs loki
docker-compose logs grafana
docker-compose logs promtail
```

### Cek Network Connectivity
```bash
# Dari Grafana ke Loki
docker exec grafana ping -c 3 loki

# Dari Promtail ke Loki
docker exec promtail ping -c 3 loki
```

### Test API Endpoints
```bash
# Loki ready endpoint
curl http://localhost:3100/ready

# Loki metrics
curl http://localhost:3100/metrics

# Loki query
curl -G "http://localhost:3100/loki/api/v1/labels"
```

## Common Issues

### Issue: "connection refused"
**Solusi**: Loki belum siap. Tunggu beberapa detik dan coba lagi, atau restart services.

### Issue: "no such host"
**Solusi**: Network tidak terhubung. Pastikan semua containers dalam network `logging-network`.

### Issue: "timeout"
**Solusi**: Health check gagal. Cek log Loki untuk error, atau restart container.

### Issue: "403 Forbidden"
**Solusi**: Masalah autentikasi. Pastikan `auth_enabled: false` di loki-config.yml.

