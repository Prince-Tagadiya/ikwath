# 🌿 iKwath (SIH26048) — Technical Defense & Presentation Guide
**Ministry of Ayush | All India Institute of Ayurveda (AIIA)**
*Smart India Hackathon 2026 — Hardware / MedTech / BioTech Category*

---

## 📌 1. Tech Stack Overview (What Was Used & Why)

When judges ask *"What technologies did you use to build this system and why?"*, use this explanation:

### **Frontend & UI Layer**
- **Language**: **TypeScript (React 19)**
  - *Why*: TypeScript guarantees strict type safety for critical medical/pharmaceutical parameters (temperatures, masses, timings, actuator states). Prevents runtime errors on unattended touch kiosks. React 19 provides instant reactive state updates for real-time sensor streams without UI stutter.
- **Build Tool**: **Vite 6**
  - *Why*: Extremely lightweight, instant HMR (Hot Module Replacement), and compiles into highly optimized static ESM bundles with zero heavy server overhead, making it ideal for low-power ARM devices like Raspberry Pi.
- **Styling**: **Modern Vanilla CSS & Tailwind v4 Architecture**
  - *Why*: Native hardware-accelerated CSS animations (`transform`, `opacity`) running at 60 FPS on 7-inch Raspberry Pi capacitive touchscreens without consuming CPU cycles needed for GPIO/sensors.
- **Component Icons**: **Lucide React** (clean, medical-grade vector icons).

### **Embedded & Hardware Control Layer**
- **Host System**: **Raspberry Pi 4 / CM4 (Compute Module 4)** running Linux in **Chromium Kiosk Mode** (`--kiosk --disable-infobars --check-for-update-interval=31536000`).
- **Hardware Interfacing**: **Python / C++ Micro-Daemon via WebSockets / Web Serial API**.
  - *Why*: The React frontend connects directly to local serial ports or a lightweight local WebSocket daemon that reads GPIO, ADC, and RTD bus lines in real time (<50ms latency).
- **Offline-First Storage**: Local browser IndexedDB & SQLite on Raspberry Pi.
  - *Why*: Meets the **"Offline Mode"** requirement shown in the UI header. Clinics in rural areas can brew standardized Kwatha without internet connectivity.

---

## ⚙️ 2. Hardware Architecture & Sensor Working Principle

Judges will test your engineering depth on **how the hardware actually achieves the standard**:

```
 ┌─────────────────────────────────────────────────────────────┐
 │           Raspberry Pi Touch Display (React Kiosk UI)       │
 └──────────────────────────────┬──────────────────────────────┘
                                │ WebSerial / Local WebSockets
 ┌──────────────────────────────▼──────────────────────────────┐
 │          Main Controller (RPi GPIO / ESP32 Controller)      │
 └──────┬──────────────┬──────────────┬──────────────┬─────────┘
        │              │              │              │
 ┌──────▼─────┐ ┌──────▼─────┐ ┌──────▼─────┐ ┌──────▼─────┐
 │ Load Cell  │ │   PT100    │ │   NEMA     │ │Peristaltic │
 │  + HX711   │ │RTD + MAX   │ │  Stepper   │ │Pump & SS316│
 │ (400g→100g)│ │ (85–90 °C) │ │ (110 RPM)  │ │   Valves   │
 └────────────┘ └────────────┘ └────────────┘ └────────────┘
```

### **1. Mass Reduction Tracking (The "1/4th Endpoint" Mechanism)**
- **Sensor**: 1 kg precision strain gauge load cell with **HX711 24-bit ADC amplifier**.
- **How it works**: The boiling chamber sits on a tare-calibrated load platform. It detects the initial 400 mL water fill (400 g) and continuously transmits mass data. When the mass reaches **~100 g to 102 g** (taking into account dissolved solids extractive yield), the heating element immediately cuts off.
- **Why this matters**: Classical Ayurveda (*Sharangadhara Samhita*) mandates reducing water to 1/4th. Manual boiling causes under-reduction (watery, weak extract) or over-reduction (charred, degraded tannins). iKwath automates exact gravimetric endpoint detection.

### **2. Temperature Control (Mild Heat Preservation)**
- **Sensor**: **PT100 Platinum Resistance Temperature Detector (RTD)** with **MAX31865 SPI digitizer**.
- **How it works**: PT100 provides ±0.1 °C accuracy. A software **PID (Proportional-Integral-Derivative) controller** regulates a solid-state relay (SSR) on the heating coil.
- **Why this matters**: Harsh boiling (100 °C+) degrades volatile thermolabile phytochemicals (e.g., Withanolides in Ashwagandha, Eugenol in Tulsi). iKwath holds the decoction strictly at **mild heat (85–90 °C)** per PCIM&H / API guidelines.

### **3. Continuous Agitation & Accelerated Evaporation**
- **Actuator**: **NEMA 17 Stepper Motor** with magnetic coupling or food-grade PTFE/SS316 paddle.
- **Speed**: Configured per formulation monograph (100–120 RPM).
- **How it solves the problem statement**: Problem Statement SIH26048 asks to *“shorten preparation time without altering decoction quality or yield”*. Continuous gentle stirring increases surface renewal and evaporation rate, reducing brew time from 60+ minutes down to 18–22 minutes without raising the temperature above 90 °C!

### **4. Pod System (Yavakuṭa Cūrṇa)**
- **Filter Medium**: Heat-stable, food-grade PLA / cellulose biodegradable brew pouch.
- **Powder Grade**: Standardized **coarse powder (Yavakuṭa Cūrṇa, 10/40 to 20/40 mesh)**. Fine powder causes choking and muddy liquid; whole herbs fail to extract. Yavakuṭa allows complete extractive solvent penetration while leaving the spent powder cleanly inside the removable pod.
- **Pod Recognition**: Encoded RFID tag / QR profile on each pod automatically informs the machine of the recipe parameters (Water mL, Temp target, Soak time, Stirrer speed).

---

## ❓ 3. Top 10 Rapid-Fire Questions Judges Will Ask (& How to Answer)

### **Q1: "Why did you build a web app (React) instead of native C++ / Python GUI (like Qt or Tkinter)?"**
> **Answer**:
> *"We chose React with TypeScript and Vite because touch kiosks in modern medical appliances (like modern autoclaves and espresso kiosks) run embedded Chromium in Kiosk Mode. React allows rich touch responsiveness, micro-animations, instant over-the-air (OTA) UI updates, and device-agnostic operation. If a doctor wants to access the machine telemetry from their tablet or hospital EHR, the exact same web app serves as a remote dashboard without rewriting code in Qt."*

---

### **Q2: "How does the machine know when the Kwatha is done?"**
> **Answer**:
> *"It does not rely on a simple kitchen timer. It uses real-time gravimetric feedback from a calibrated Load Cell with an HX711 24-bit ADC. In classical Ayurveda, Kwatha requires a 1/4th reduction (from 400 mL water down to 100 mL decoction). Our firmware continuously monitors mass loss. Once the mass reaches the 100g–102g endpoint, the PID controller shuts down the heating coil and triggers filtration."*

---

### **Q3: "How do you achieve faster brewing without destroying the herbs?"**
> **Answer**:
> *"Most people try to speed up cooking by cranking up the heat to 100 °C+, which hydrolyzes and degrades active polyphenols and volatile oils. We keep the temperature strictly at 85–90 °C as mandated by API/AFI, but accelerate evaporation mechanically by continuous surface stirring (100–120 RPM) and an optimized chamber surface area-to-volume ratio. This doubles the surface evaporation rate while preserving 100% of the phytochemical profile."*

---

### **Q4: "Why Yavakuṭa Cūrṇa (coarse powder) and not fine powder or raw whole roots?"**
> **Answer**:
> *"This directly follows the Ayurvedic Pharmacopoeia of India (API) Part-II standard. Fine powder (*sūkṣma cūrṇa*) creates a colloidal sludge that blocks filters and burns on heating surfaces. Whole roots have too little exposed surface area for solvent extraction within 20 minutes. Yavakuṭa Cūrṇa (sieved through 10/40 or 20/40 mesh) allows deionized potable water to extract active water-soluble glycosides and alkaloids with zero particulate carryover."*

---

### **Q5: "What happens if there's no Internet in a remote clinic?"**
> **Answer**:
> *"iKwath is completely offline-first. As demonstrated on our topbar with the '✓ Offline Mode' indicator, all 12 AFI/API formulation profiles, sensor calibration curves, and brew history are stored on-device (local flash/IndexedDB). Internet is only needed if the clinic wants to sync batch records to the Ayush National Portal or AIIA Clinical Trials Dashboard."*

---

### **Q6: "What is the 2-Tap User Experience you designed?"**
> **Answer**:
> *"In a busy Ayurvedic OPD or household, users don't want complex menus. On the touch screen, Tap 1 selects the formulation card (with botanical imagery and monograph tags), and Tap 2 hits the large 'Start Brew ➔' button. The machine auto-configures water dosing, soaking, temperature, and stirring without human error."*

---

### **Q7: "How is contamination prevented between different herb brews?"**
> **Answer**:
> *"1. The spent herbal powder never touches the chamber walls; it remains encapsulated inside the disposable biodegradable pod.
> 2. The fluid contact path uses medical-grade SS316 stainless steel and food-grade silicone tubing.
> 3. The system has an automated post-brew hot rinse cycle ('Step 11 · Cleaning Cycle') that purges the lines before the next batch."*

---

### **Q8: "What standards or formulations are included?"**
> **Answer**:
> *"We integrated 12 standardized classical formulations conforming to PCIM&H and AFI monographs:
> - **Ayush Kwatha** (PCIM&H 4:2:2:1 Tulsi-Dalchini-Sunthi-Maricha standard)
> - **Ashwagandha Kwatha** (API Part-I Vol-I)
> - **Dashamoola Kwatha** (AFI Part-I 4:10 10-root anti-inflammatory)
> - **Triphala Kwatha** (AFI Part-I 4:15 master digestive)
> - Plus **Guduchi**, **Maharasnadi**, **Punarnavadi**, **Varunadi**, **Manjishtadi**, **Vasadi**, **Nirgundi**, and **Pathyadi**."*

---

### **Q9: "How do you ensure food safety and electrical safety?"**
> **Answer**:
> *"The boiling vessel uses passivated SS316 stainless steel. We incorporate redundant safety cutoffs: a dry-run detection algorithm on the load cell (prevents heating without water), an anti-boil-over optical/conductive foam sensor, and thermal bimetallic backup fuses at 115 °C."*

---

### **Q10: "Can this system integrate with Ayush hospital management (HMIS / CTMS)?"**
> **Answer**:
> *"Yes. Each completed brew generates a cryptographic **'Brew Passport'** recording batch ID, pod serial number, temperature time-series curve, mass reduction curve, and pass/fail QA status. This payload can be exported in FHIR/JSON format directly into the AIIA Clinical Trial Management System (CTMS)."*

---

## 🎯 4. One-Minute Elevator Pitch Script (Memorize for Intro)

> *"Respected Judges, classical Ayurvedic Kwatha is the gold standard of herbal medicine, but preparing it correctly by hand requires tedious slow reduction, precise temperature regulation, and coarse Yavakuṭa powder that must be consumed fresh within 3 hours.*
> 
> *Our project, **iKwath**, solves SIH Problem Statement **26048** for the **Ministry of Ayush**. It is a smart, pod-based countertop appliance powered by an intuitive touch interface. With our 2-tap workflow, a user selects an AFI/API-standardized formulation like Ayush Kwath or Dashamoola. The system automatically regulates mild boiling at 85–90 °C using a PT100 sensor, tracks real-time mass reduction to exactly one-fourth using a 24-bit Load Cell, accelerates extraction through controlled 110 RPM agitation, and dispenses a clear, freshly prepared therapeutic dose in under 20 minutes.*
> 
> *It combines ancient classical wisdom with modern precision engineering."*

---

*Prepared for SIH 2026 Presentation · Team iKwath*
