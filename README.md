# 🏎️ Navitek Robotaksi Software Architecture

**Konya Teknik Universitesi - Teknofest Robotaksi Binek Otonom Yarismasi** icin gelistirilen yazilim mimarisidir. Projenin amaci; sensor verilerini isleyerek aracin karar vermesini ve guvenli sekilde hareket etmesini saglamaktir.

---

## 🛠️ Technologies & Requirements

* **OS:** Ubuntu 20.04 LTS 
* **Middleware:** ROS 2 Foxy 
* **Language:** Python 
* **Simulation:** Gazebo Classic
* **Build System:** Colcon

---

## 📂 Project Modules

| Module | Description |
| :--- | :--- |
| **Perception** | Kamera ve sensor verilerini isler, nesne ve yol tespitini yapar. |
| **Control** | Aracin hiz ve yon komutlarini yonetir, `/cmd_vel` uzerinden hareketi saglar. |
| **Localization** | Odom ve IMU verilerini kullanarak aracin pozisyonunu belirler. |
| **Planning** | Engelleri tespit eder, guvenli mesafe frenlemesi ve **State Machine** yonetimi yapar. |

navitek_robotaxi/
 ├── perception/      # Goruntu isleme kodlari
 ├── control/         # Arac surus algoritmalari
 ├── localization/    # Konum belirleme (EKF/SLAM)
 ├── planning/        # Karar verme ve rota planlama
 └── README.md        # Proje dokumantasyonu


















# yemekhane_otomasyonu
