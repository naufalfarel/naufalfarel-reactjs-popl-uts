# Setup Logging dengan Loki, Grafana, dan Promtail

Dokumentasi ini menjelaskan cara setup dan menggunakan logging stack dengan Loki, Grafana, dan Promtail untuk aplikasi TabbyCare.

## 📋 Komponen

- **Loki**: Sistem agregasi log (seperti Prometheus untuk logs)
- **Grafana**: Platform visualisasi dan monitoring
- **Promtail**: Agent yang mengumpulkan dan mengirim log ke Loki

## 🚀 Cara Setup

### 1. Pastikan Docker dan Docker Compose Terinstall

```bash
docker --version
docker-compose --version
```

### 2. Jalankan Stack Logging

```bash
docker-compose up -d
```

Perintah ini akan menjalankan:
- **Loki** di port `3100`
- **Grafana** di port `3000`
- **Promtail** (tidak ada port eksternal, hanya internal)

### 3. Akses Grafana

1. Buka browser dan akses: `http://localhost:3000`
2. Login dengan kredensial default:
   - **Username**: `admin`
   - **Password**: `admin`
3. Grafana akan meminta untuk mengganti password (opsional)

### 4. Verifikasi Data Source

1. Di Grafana, buka **Configuration** → **Data Sources**
2. Pastikan **Loki** sudah terkonfigurasi sebagai data source default
3. Klik **Loki** dan test koneksi dengan tombol **Save & Test**

## 📊 Menggunakan Grafana untuk Melihat Logs

### Query Logs di Grafana

1. Buka **Explore** di menu sidebar
2. Pilih data source **Loki**
3. Gunakan LogQL query untuk melihat logs:

#### Query Dasar

```logql
{job="backend"}
```

#### Filter berdasarkan Level

```logql
{job="backend"} |= "ERROR"
{job="backend"} |= "WARN"
{job="backend"} |= "INFO"
```

#### Filter berdasarkan Service

```logql
{job="backend", service="backend"}
```

#### Filter berdasarkan Waktu

```logql
{job="backend"} [5m]
```

#### Kombinasi Query

```logql
{job="backend"} |= "error" | json | level="ERROR"
```

### Membuat Dashboard

1. Buka **Dashboards** → **New Dashboard**
2. Tambahkan panel baru
3. Pilih **Loki** sebagai data source
4. Gunakan query LogQL untuk menampilkan logs
5. Simpan dashboard

## 🔧 Konfigurasi

### Struktur File Logging

```
backend/
  logs/
    app.log          # File log aplikasi (JSON format)
```

### Format Log

Log ditulis dalam format JSON untuk memudahkan parsing oleh Promtail:

```json
{
  "timestamp": "2024-01-15T10:30:00.000Z",
  "level": "INFO",
  "service": "backend",
  "message": "Server started",
  "port": 5000,
  "url": "http://localhost:5000"
}
```

### Menggunakan Logger di Backend

```javascript
const logger = require('./utils/logger');

// Info log
logger.info('User logged in', { userId: '123', email: 'user@example.com' });

// Warning log
logger.warn('Rate limit approaching', { requests: 95, limit: 100 });

// Error log
logger.error('Database connection failed', { error: err.message, stack: err.stack });

// Debug log (hanya di development)
logger.debug('Processing request', { method: 'GET', path: '/api/users' });
```

## 📁 File Konfigurasi

### `docker-compose.yml`
Mengatur container untuk Loki, Grafana, dan Promtail.

### `loki-config.yml`
Konfigurasi untuk Loki (storage, schema, dll).

### `promtail-config.yml`
Konfigurasi untuk Promtail (scrape configs, labels, dll).

### `grafana/provisioning/`
Auto-provisioning untuk Grafana (data sources dan dashboards).

## 🐛 Troubleshooting

### Logs tidak muncul di Grafana

1. **Cek apakah Promtail berjalan**:
   ```bash
   docker ps | grep promtail
   ```

2. **Cek log Promtail**:
   ```bash
   docker logs promtail
   ```

3. **Pastikan file log ada**:
   ```bash
   ls -la backend/logs/
   ```

4. **Cek koneksi Promtail ke Loki**:
   ```bash
   docker logs promtail | grep -i error
   ```

### Loki tidak bisa diakses

1. **Cek status container**:
   ```bash
   docker ps | grep loki
   ```

2. **Cek log Loki**:
   ```bash
   docker logs loki
   ```

3. **Test koneksi**:
   ```bash
   curl http://localhost:3100/ready
   ```

### Grafana tidak bisa connect ke Loki

**Ini adalah masalah umum. Ikuti langkah-langkah berikut:**

1. **Restart services**:
   ```bash
   docker-compose down
   docker-compose up -d
   # Tunggu 10-15 detik untuk Loki siap
   ```

2. **Verifikasi Loki berjalan**:
   ```bash
   docker logs loki
   curl http://localhost:3100/ready
   ```

3. **Test koneksi dari Grafana container**:
   ```bash
   docker exec grafana wget -O- http://loki:3100/ready
   ```

4. **Pastikan network terhubung**:
   - Semua containers harus dalam network `logging-network`
   - URL di data source harus: `http://loki:3100` (bukan `http://localhost:3100`)

5. **Jika masih error, reset data source di Grafana**:
   - Buka Grafana → Configuration → Data Sources
   - Delete data source Loki
   - Add new → Loki
   - URL: `http://loki:3100`
   - Save & Test

**Lihat [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) untuk panduan lengkap troubleshooting.**

## 🔄 Restart Services

```bash
# Restart semua services
docker-compose restart

# Restart service tertentu
docker-compose restart loki
docker-compose restart grafana
docker-compose restart promtail
```

## 🛑 Stop Services

```bash
docker-compose down
```

Untuk menghapus volumes juga:
```bash
docker-compose down -v
```

## 📝 Best Practices

1. **Structured Logging**: Selalu gunakan format JSON untuk log
2. **Log Levels**: Gunakan level yang sesuai (INFO, WARN, ERROR, DEBUG)
3. **Metadata**: Tambahkan metadata yang relevan untuk debugging
4. **Retention**: Konfigurasi retention policy di Loki untuk menghemat storage
5. **Labels**: Gunakan labels yang konsisten untuk filtering yang mudah

## 🔗 Referensi

- [Loki Documentation](https://grafana.com/docs/loki/latest/)
- [Grafana Documentation](https://grafana.com/docs/grafana/latest/)
- [Promtail Documentation](https://grafana.com/docs/loki/latest/clients/promtail/)
- [LogQL Query Language](https://grafana.com/docs/loki/latest/logql/)

