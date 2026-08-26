import React, { useState } from "react";
import { Terminal, Copy, Check, Code, Play, ArrowRight, Download } from "lucide-react";

export default function PythonColabHub() {
  const [copied, setCopied] = useState(false);

  const colabPythonCode = `# ==============================================================================
# SMART INTEGRATED FARMING MANAGEMENT SYSTEM (SIFMS) - STREAMLIT APP
# Evolving across Levels 1, 2, and 3: GIS, Machine Learning, and AI Decision Support
# ==============================================================================

import streamlit as st
import pandas as pd
import numpy as np
import os
import requests
import json
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import LabelEncoder
import folium
from folium.plugins import HeatMap
from streamlit_folium import st_folium

# --- PAGE SETUP ---
st.set_page_config(
    page_title="Smart SIFMS - AI & GIS Platform",
    page_icon="🌾",
    layout="wide",
    initial_sidebar_state="expanded"
)

# --- SYSTEM CONSTANTS & DATABASE INITIALIZATION ---
DB_FILE = "farmers_dataset.csv"

MALAWI_DISTRICTS = {
    "Lilongwe": {"lat": -13.962, "lon": 33.774, "temp": 21, "rain": 450, "suitability": "Maize, Groundnuts"},
    "Salima": {"lat": -13.784, "lon": 34.451, "temp": 25, "rain": 620, "suitability": "Rice"},
    "Zomba": {"lat": -15.388, "lon": 35.322, "temp": 20, "rain": 580, "suitability": "Maize, Beans"},
    "Blantyre": {"lat": -15.782, "lon": 35.008, "temp": 19, "rain": 510, "suitability": "Maize, Beans"},
    "Karonga": {"lat": -9.933, "lon": 33.931, "temp": 27, "rain": 680, "suitability": "Rice"},
    "Mzimba": {"lat": -11.902, "lon": 33.603, "temp": 20, "rain": 410, "suitability": "Groundnuts, Beans"},
}

CROP_DB = {
    "maize": {"duration": "120 days", "temp_range": "18-27 °C", "risk": "High sensitivity to drought; watch fall armyworm", "water_req": "High"},
    "beans": {"duration": "90 days", "temp_range": "15-22 °C", "risk": "Medium sensitivity; watch root rot in waterlogged soils", "water_req": "Moderate"},
    "groundnuts": {"duration": "130 days", "temp_range": "20-30 °C", "risk": "Moderate; susceptible to rosette virus and aflatoxin", "water_req": "Low"},
    "rice": {"duration": "150 days", "temp_range": "24-32 °C", "risk": "High; needs flooded conditions; highly vulnerable to cold stress", "water_req": "Very High"},
}

def generate_sample_dataset():
    """Generates synthetic historical farm profiles to seed the Machine Learning Model."""
    np.random.seed(42)
    sample_size = 250
    
    crops = ["maize", "beans", "groundnuts", "rice"]
    districts = list(MALAWI_DISTRICTS.keys())
    
    data = []
    for _ in range(sample_size):
        crop = np.random.choice(crops)
        district = np.random.choice(districts)
        farm_size = np.random.uniform(0.5, 8.0) # hectares
        fertilizer = farm_size * np.random.uniform(30, 150) # kg
        
        # Base climatology + random variation
        base_temp = MALAWI_DISTRICTS[district]["temp"]
        base_rain = MALAWI_DISTRICTS[district]["rain"]
        temp = base_temp + np.random.uniform(-3, 3)
        rain = base_rain + np.random.uniform(-100, 100)
        
        # Target Yield baseline computation with crop coefficients and random noise
        coefs = {"maize": 2500, "rice": 3500, "groundnuts": 1600, "beans": 1100}
        yield_per_ha = coefs[crop] + (fertilizer * 5.5) + (rain * 2.1) - (abs(temp - 22) * 120)
        yield_per_ha = max(yield_per_ha, 500) # guarantee floor
        total_yield = yield_per_ha * farm_size
        
        data.append({
            "name": f"Farmer {np.random.randint(100, 999)}",
            "age": np.random.randint(22, 65),
            "district": district,
            "latitude": MALAWI_DISTRICTS[district]["lat"] + np.random.uniform(-0.15, 0.15),
            "longitude": MALAWI_DISTRICTS[district]["lon"] + np.random.uniform(-0.15, 0.15),
            "crop_type": crop,
            "growth_stage": np.random.choice(["seedling", "vegetative", "flowering", "maturity"]),
            "farm_size": round(farm_size, 2),
            "fertilizer_usage": round(fertilizer, 2),
            "avg_temp": round(temp, 1),
            "avg_rainfall": round(rain, 1),
            "actual_yield": round(total_yield, 1),
            "risk_score": np.random.choice(["Low", "Medium", "High"])
        })
        
    df = pd.DataFrame(data)
    df.to_csv(DB_FILE, index=False)
    return df

def load_data():
    if not os.path.exists(DB_FILE):
        return generate_sample_dataset()
    return pd.read_csv(DB_FILE)

# Initialize dataset
df_db = load_data()

# --- WEATHER INTEGRATION (OpenWeatherMap API fallback) ---
def get_weather_data(lat, lon, district_name):
    # Configure your OpenWeatherMap API Key in streamlit secrets for live queries:
    # api_key = st.secrets.get("OPENWEATHER_API_KEY", None)
    api_key = None 
    
    if api_key:
        try:
            url = f"https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&units=metric&appid={api_key}"
            res = requests.get(url, timeout=5)
            if res.status_code == 200:
                data = res.json()
                return {
                    "temp": data["main"]["temp"],
                    "humidity": data["main"]["humidity"],
                    "rainfall": data.get("rain", {}).get("1h", 0.0),
                    "desc": data["weather"][0]["description"].title()
                }
        except Exception:
            pass
            
    # Fallback simulation modeled on Malawian Climatology (June winter season)
    climate = MALAWI_DISTRICTS.get(district_name, {"temp": 22, "rain": 40})
    return {
        "temp": round(climate["temp"] + np.random.uniform(-1.5, 1.5), 1),
        "humidity": np.random.randint(50, 70),
        "rainfall": round(climate["rain"] / 100.0, 2),
        "desc": "Sunny & Dry (S-S Fallback Simulator)"
    }

# --- MACHINE LEARNING YIELD ENGINE ---
def train_yield_predictor(df):
    """Encodes categorical variables and fits a robust Random Forest Regressor."""
    encoder = LabelEncoder()
    df_train = df.copy()
    df_train["crop_enc"] = encoder.fit_transform(df_train["crop_type"])
    
    X = df_train[["farm_size", "fertilizer_usage", "avg_temp", "avg_rainfall", "crop_enc"]]
    y = df_train["actual_yield"]
    
    model = RandomForestRegressor(n_estimators=100, random_state=42)
    model.fit(X, y)
    
    return model, encoder

ml_model, crop_encoder = train_yield_predictor(df_db)

# --- SIDEBAR NAVIGATION ---
st.sidebar.image("https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&q=80&w=200", caption="SMART SIFMS CORE Engine")
st.sidebar.title("🌿 Navigation Hub")
menu = st.sidebar.radio(
    "Choose Platform Module:",
    [
        "👨‍🌾 Farmer Registry (L1)",
        "🌾 Crop Lifecycles (L1)",
        "🌦️ Weather Dashboard (L2)",
        "📊 ML Yield Modeler (L2)",
        "🗺️ GIS Ag-Maps (L2)",
        "📈 District Analytics (L2)",
        "🧠 AI Smart Advising (L3)"
    ]
)

# ------------------------------------------------------------------------------
# 1. FARMER REGISTRY MODULE
# ------------------------------------------------------------------------------
if menu == "👨‍🌾 Farmer Registry (L1)":
    st.header("👨‍🌾 Farmer Spatial Registry")
    st.subheader("Level 1 Core Feature: Farmer Record Management")
    
    col1, col2 = st.columns([1, 2])
    with col1:
        st.write("##### Add New Farmer Profile")
        with st.form("new_farmer_form", clear_on_submit=True):
            f_name = st.text_input("Full Name", placeholder="e.g. Kondwani Phiri")
            f_age = st.number_input("Farmer Age", min_value=18, max_value=90, value=35)
            f_dist = st.selectbox("Assign Home District", list(MALAWI_DISTRICTS.keys()))
            
            # Autopopulate coordinates
            coords = MALAWI_DISTRICTS[f_dist]
            f_lat = st.number_input("Latitude Coords", value=coords["lat"], format="%.6f")
            f_lon = st.number_input("Longitude Coords", value=coords["lon"], format="%.6f")
            
            f_crop = st.selectbox("Primary Crop Type", ["maize", "beans", "groundnuts", "rice"])
            f_size = st.number_input("Farm Land Area (Hectares)", min_value=0.1, max_value=50.0, value=2.0)
            f_fert = st.number_input("Fertilizer Budget (kg)", min_value=0.0, max_value=500.0, value=100.0)
            
            submit = st.form_submit_form_button = st.form_submit_button("Register Farmer Spatial Node")
            
            if submit and f_name:
                # Add directly to database df
                new_row = {
                    "name": f_name,
                    "age": int(f_age),
                    "district": f_dist,
                    "latitude": f_lat,
                    "longitude": f_lon,
                    "crop_type": f_crop,
                    "growth_stage": "seedling",
                    "farm_size": round(f_size, 2),
                    "fertilizer_usage": round(f_fert, 2),
                    "avg_temp": MALAWI_DISTRICTS[f_dist]["temp"],
                    "avg_rainfall": MALAWI_DISTRICTS[f_dist]["rain"],
                    "actual_yield": 0.0, # Will be computed or updated
                    "risk_score": "Low"
                }
                
                # SIFMS ML model auto-assesses yield prediction on submission
                try:
                    crop_idx = crop_encoder.transform([f_crop])[0]
                    pred_feat = [[f_size, f_fert, new_row["avg_temp"], new_row["avg_rainfall"], crop_idx]]
                    new_yield = ml_model.predict(pred_feat)[0]
                    new_row["actual_yield"] = round(new_yield, 1)
                except:
                    new_row["actual_yield"] = 1500.0
                    
                df_db = pd.concat([df_db, pd.DataFrame([new_row])], ignore_index=True)
                df_db.to_csv(DB_FILE, index=False)
                st.success(f"Farmer '{f_name}' successfully added with ML estimated yield of {new_row['actual_yield']} kg!")
                st.rerun()

    with col2:
        st.write("##### Registered Farmers Spatial Directory")
        st.dataframe(df_db, use_container_width=True)
        
        # Fast edit operations
        st.write("##### Edit Farmer Stage")
        selected_farmer = st.selectbox("Select Profile", df_db["name"].unique())
        if selected_farmer:
            idx = df_db[df_db["name"] == selected_farmer].index[0]
            current_stage = df_db.loc[idx, "growth_stage"]
            new_stage = st.selectbox("Advance Growth Sequence", ["seedling", "vegetative", "flowering", "maturity", "harvested"], index=["seedling", "vegetative", "flowering", "maturity", "harvested"].index(current_stage) if current_stage in ["seedling", "vegetative", "flowering", "maturity", "harvested"] else 0)
            
            if st.button("Commit Phase Transition"):
                df_db.loc[idx, "growth_stage"] = new_stage
                df_db.to_csv(DB_FILE, index=False)
                st.success(f"Farmer '{selected_farmer}' advanced to stage: **{new_stage}**!")
                st.rerun()

# ------------------------------------------------------------------------------
# 2. CROP LIFECYCLE MANAGEMENT
# ------------------------------------------------------------------------------
elif menu == "🌾 Crop Lifecycles (L1)":
    st.header("🌾 Regional Crop Lifecycle Intel")
    st.subheader("Base agronomic profiles for Malawi staple crops")
    
    for crop, data in CROP_DB.items():
        with st.expander(f"Crop Standard: {crop.capitalize()}"):
            c1, c2, c3 = st.columns(3)
            with c1:
                st.metric("Growth Cycle Duration", data["duration"])
            with c2:
                st.metric("Water Requirements", data["water_req"])
            with c3:
                st.metric("Ideal Temperature Range", data["temp_range"])
            st.warning(f"**Vulnerability & Risk Matrix:** {data['risk']}")

# ------------------------------------------------------------------------------
# 3. METEOROLOGICAL WEATHER ENGINE
# ------------------------------------------------------------------------------
elif menu == "🌦️ Weather Dashboard (L2)":
    st.header("🌦️ Real-Time Agrometeorological Weather Server")
    st.subheader("Level 2 Sensor Data Integration (OpenWeatherMap API fallback)")
    
    district = st.selectbox("Examine Microclimate Station", list(MALAWI_DISTRICTS.keys()))
    coords = MALAWI_DISTRICTS[district]
    
    weather = get_weather_data(coords["lat"], coords["lon"], district)
    
    w_col1, w_col2, w_col3, w_col4 = st.columns(4)
    with w_col1:
        st.metric("Meteorological Sky", weather["desc"])
    with w_col2:
        st.metric("Atmospheric Temp", f"{weather['temp']} °C")
    with w_col3:
        st.metric("Relative Humidity", f"{weather['humidity']}%")
    with w_col4:
        st.metric("Rainfall Rate", f"{weather['rainfall']} mm")
        
    st.info(f"Meteorological properties are pulled using coords: Lat {coords['lat']}, Lon {coords['lon']}. This simulates soil evapotranspiration estimates!")

# ------------------------------------------------------------------------------
# 4. DATA SCIENCE MACHINE LEARNING MODELER
# ------------------------------------------------------------------------------
elif menu == "📊 ML Yield Modeler (L2)":
    st.header("📊 ML Agricultural Regressor Model")
    st.subheader("Level 2 Machine Learning: Yield Prediction Model (Scikit-Learn Random Forest)")
    
    st.write("Estimate localized yields instantly using the trained Random Forest model.")
    
    input_crop = st.selectbox("Simulate Crop Selection", ["maize", "beans", "groundnuts", "rice"])
    p_size = st.slider("Cultivated Area (Hectares)", 0.2, 15.0, 3.5, step=0.1)
    p_fert = st.slider("Nitrogen/NPK Fertilizer usage (kg)", 0.0, 800.0, 150.0, step=10.0)
    p_temp = st.slider("Sustained Temperature (°C)", 14.0, 36.0, 22.0, step=0.5)
    p_rain = st.slider("Accumulated Rainfall Volume (mm)", 100.0, 1000.0, 500.0, step=10.0)
    
    if st.button("Compute Yield Prediction Projections"):
        crop_idx = crop_encoder.transform([input_crop])[0]
        feats = np.array([[p_size, p_fert, p_temp, p_rain, crop_idx]])
        predicted_yield = ml_model.predict(feats)[0]
        
        st.subheader("Prediction Results")
        col1, col2 = st.columns(2)
        with col1:
            st.metric(label="Predicted Yield Outputs", value=f"{round(predicted_yield, 1)} kg", delta=f"{round(predicted_yield / p_size, 1)} kg/Ha")
        with col2:
            st.write("**Model Parameters Used:**")
            st.write(f"- Hectares: {p_size} Ha | Fertilizer input: {p_fert} kg")
            st.write(f"- Temperature: {p_temp}°C | SIFMS Rainfall Coefficient: {p_rain}mm")

# ------------------------------------------------------------------------------
# 5. GEOGRAPHIC INFORMATION SYSTEM (GIS)
# ------------------------------------------------------------------------------
elif menu == "🗺️ GIS Ag-Maps (L2)":
    st.header("🗺️ GIS spatial agricultural Map")
    st.subheader("Integrated Farming GIS Map Visualization (Folium Engine)")
    
    map_layer = st.radio("Switch SIFMS Map Overlay Layer:", ["Farmers Locations", "Yield Heatmap", "Farm Size Heatmap"])
    
    # Initialize Map centered on Malawi
    m = folium.Map(location=[-13.5, 34.0], zoom_start=7, tiles="OpenStreetMap")
    
    if map_layer == "Farmers Locations":
        for idx, row in df_db.iterrows():
            crop_colors = {"maize": "blue", "beans": "green", "groundnuts": "purple", "rice": "orange"}
            folium.Marker(
                location=[row["latitude"], row["longitude"]],
                popup=f"<b>Farmer:</b> {row['name']}<br><b>Crop:</b> {row['crop_type'].capitalize()}<br><b>Hectares:</b> {row['farm_size']}<br><b>Est Yield:</b> {row['actual_yield']} kg",
                tooltip=f"{row['name']} ({row['crop_type']})",
                icon=folium.Icon(color=crop_colors.get(row["crop_type"], "red"), icon="leaf")
            ).add_to(m)
            
    elif map_layer == "Yield Heatmap":
        heat_data = [[row["latitude"], row["longitude"], row["actual_yield"]] for idx, row in df_db.iterrows()]
        HeatMap(heat_data, radius=22, blur=15).add_to(m)
        
    elif map_layer == "Farm Size Heatmap":
        heat_data = [[row["latitude"], row["longitude"], row["farm_size"]] for idx, row in df_db.iterrows()]
        HeatMap(heat_data, radius=22, blur=15).add_to(m)
        
    # Display the interactive map
    st_folium(m, width=1100, height=520)
    st.info("Interactive popups display direct farm statistics inside spatial containers.")

# ------------------------------------------------------------------------------
# 6. DISTRICT PLANNING ANALYTICS
# ------------------------------------------------------------------------------
elif menu == "📈 District Analytics (L2)":
    st.header("📈 District Agricultural Planning Center")
    st.subheader("Region Aggregations for System-wide SIFMS Oversight")
    
    dist_df = df_db.groupby("district").agg(
        total_farmers=("name", "count"),
        total_farmland=("farm_size", "sum"),
        avg_yield=("actual_yield", "mean")
    ).reset_index()
    
    col_x, col_y = st.columns(2)
    with col_x:
        st.write("#### District Summary Table")
        st.dataframe(dist_df, use_container_width=True)
    with col_y:
        st.write("#### SIFMS Charting")
        st.bar_chart(dist_df.set_index("district")[["total_farmland", "avg_yield"]])

# ------------------------------------------------------------------------------
# 7. AI SMART ADVISING & RULES ENGINE
# ------------------------------------------------------------------------------
elif menu == "🧠 AI Smart Advising (L3)":
    st.header("🧠 Level 3 AI Farming Decision Support Advisory")
    st.subheader("Expert recommendation engine utilizing Meteorological conditions and Cultivation profiles")
    
    farmer_sel = st.selectbox("Query SIFMS Farmer Target Profile", df_db["name"].unique())
    if farmer_sel:
        row = df_db[df_db["name"] == farmer_sel].iloc[0]
        crop = row["crop_type"]
        stage = row["growth_stage"]
        district_name = row["district"]
        
        st.write(f"##### Formulating Agronomic Plan for {row['name']}")
        
        # Pull simulated live weather
        weather = get_weather_data(row["latitude"], row["longitude"], district_name)
        
        st.write("**Operational Profile Compiled:**")
        st.write(f"- District: **{district_name}** | Base Crop: **{crop.capitalize()}**")
        st.write(f"- Active Phase Stage: **{stage.capitalize()}** | Current Station Temp: **{weather['temp']} °C**")
        
        # SIFMS Level 3 Expert Rules Engine logic
        st.write("#### 🛡️ AI Generated Recommendations")
        
        if crop == "maize":
            st.info("**Watering Guideline:** Maize is highly drought sensitive. Maintain soil saturation levels.")
            if stage == "seedling":
                st.success("**Agronomist Action**: Apply initial basal fertilizer (NPK blend) 5cm deep next to sprout. Conduct stem borer preventative checks.")
            elif stage == "flowering":
                st.success("**Agronomist Action**: Critically crucial pollination frame. Protect standard soil moisture levels, water deficits now drop yield metrics by 40%. Apply topdressing Urea.")
            else:
                st.success("**Agronomist Action**: Harvest when stalks dry to clear pale straw color (grain moisture below 15%).")
                
        elif crop == "rice":
            st.info("**Watering Guideline:** Flood rice fields uniformly. Keep shallow flood layers (5-10cm) during vegetative stages.")
            if stage == "vegetative":
                st.success("**Agronomist Action**: Maintain flood levels. Hand-weed any invasive water couch grass immediately before introducing nitrogen blocks.")
            else:
                st.success("**Agronomist Action**: Drain fields 10 days before target harvest to standardize grain curing sequence.")
                
        elif crop == "beans":
            st.info("**Watering Guideline:** Beans are highly susceptible to root rot and waterlogging. Ensure excellent raised bed drainage patterns.")
            if stage == "flowering":
                st.warning("**Risk Alerts**: Maintain dry leaves during watering to protect crop nodes from damp fungal blight vectors.")
                
        elif crop == "groundnuts":
            st.info("**Watering Guideline:** Groundnuts demand loose, well-aerated sandy soil columns.")
            if stage == "flowering":
                st.success("**Agronomist Action**: Avoid any machine-based weeding now as pegging pods are actively penetrating subsurface layers.")
                
        # Risk assessment
        risk_color = {"Low": "green", "Medium": "orange", "High": "red"}
        st.metric("Farm Vulnerability Assessment Index", f"{row['risk_score']} Risk", delta_color="off")
        
st.sidebar.markdown("---")
st.sidebar.write("🏷️ **SIFMS v3.0 Powered Platform**")
st.sidebar.caption("MLIMI SMART AI | Malawi Integrated Smart Farming")
`

  const handleCopy = () => {
    navigator.clipboard.writeText(colabPythonCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-slate-900 text-slate-100 rounded-2xl overflow-hidden shadow-2xl border border-slate-800 transition-all duration-300">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-700 px-6 py-8">
        <div className="flex items-center gap-3 mb-2">
          <Terminal className="h-7 w-7 text-emerald-300" id="terminal-icon" />
          <span className="bg-emerald-500/20 text-emerald-300 text-xs px-3 py-1 rounded-full border border-emerald-500/30 font-mono tracking-wider uppercase">
            Colab-Ready
          </span>
        </div>
        <h2 className="text-2xl font-sans font-bold text-white tracking-tight">
          Malawi mlimi Smart Google Colab & Python Center
        </h2>
        <p className="text-slate-200 text-sm mt-1 max-w-2xl font-light">
          Deploy this exact GIS mapping, Machine Learning regression models, and rules engine
          directly on your local computer, Streamlit Cloud services, or inside a Google Colab notebook.
        </p>
      </div>

      {/* Main Grid */}
      <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Step-by-Step Instructions */}
        <div className="lg:col-span-5 space-y-5">
          <h3 className="text-lg font-sans font-semibold text-teal-300 flex items-center gap-2">
            <Play className="h-5 w-5" /> Launch Steps & Deployment Guides
          </h3>

          <div className="space-y-4">
            {/* Step 1 */}
            <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/50 hover:bg-slate-800 transition duration-200">
              <div className="flex gap-3">
                <span className="flex-shrink-0 h-7 w-7 rounded-lg bg-teal-500/20 text-teal-400 font-mono font-bold text-sm flex items-center justify-center border border-teal-500/30">
                  1
                </span>
                <div>
                  <h4 className="font-medium text-slate-200 text-sm font-sans mb-1">
                    Open Google Colab Notebook
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed font-light">
                    Go to{" "}
                    <a
                      href="https://colab.research.google.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-teal-400 underline hover:text-teal-300 font-mono"
                    >
                      colab.research.google.com
                    </a>{" "}
                    and create a brand new cell block using Python 3 runtime settings.
                  </p>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/50 hover:bg-slate-800 transition duration-200">
              <div className="flex gap-3">
                <span className="flex-shrink-0 h-7 w-7 rounded-lg bg-emerald-500/20 text-emerald-400 font-mono font-bold text-sm flex items-center justify-center border border-emerald-500/30">
                  2
                </span>
                <div>
                  <h4 className="font-medium text-slate-200 text-sm font-sans mb-1">
                    Install SIFMS Dependencies
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed font-light">
                    Add this installation script in a block and execute it to setup core libraries,
                    including Streamlit, Folium maps, scikit-learn regressor, and maps connectors:
                  </p>
                  <pre className="bg-slate-950 p-2 rounded-lg text-emerald-400 text-[10px] font-mono mt-2 border border-slate-800 overflow-x-auto">
                    {"!pip install streamlit streamlit-folium folium scikit-learn pandas numpy requests -q"}
                  </pre>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/50 hover:bg-slate-800 transition duration-200">
              <div className="flex gap-3">
                <span className="flex-shrink-0 h-7 w-7 rounded-lg bg-indigo-500/20 text-indigo-400 font-mono font-bold text-sm flex items-center justify-center border border-indigo-500/30">
                  3
                </span>
                <div>
                  <h4 className="font-medium text-slate-200 text-sm font-sans mb-1">
                    Inject Python Code Block
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed font-light">
                    Use standard python file writer commands in Colab to write out the file:
                  </p>
                  <pre className="bg-slate-950 p-2 rounded-lg text-indigo-400 text-[10px] font-mono mt-2 border border-slate-800 overflow-x-auto">
                    {"%%writefile app.py\n# Paste the fully formatted source from side here ->"}
                  </pre>
                </div>
              </div>
            </div>

            {/* Step 4 */}
            <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/50 hover:bg-slate-800 transition duration-200">
              <div className="flex gap-3">
                <span className="flex-shrink-0 h-7 w-7 rounded-lg bg-rose-500/20 text-rose-400 font-mono font-bold text-sm flex items-center justify-center border border-rose-500/30">
                  4
                </span>
                <div>
                  <h4 className="font-medium text-slate-200 text-sm font-sans mb-1">
                    Expose using Ngrok Portals
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed font-light">
                    Expose your Streamlit background application container securely using ngrok and retrieve your public live link. Paste this in a Colab block:
                  </p>
                  <pre className="bg-slate-950 p-2 rounded-lg text-rose-400 text-[10px] font-mono mt-2 border border-slate-800 overflow-x-auto">
                    {`# Install ngrok agent
!wget -q https://bin.equinox.io/c/4VmDzA7iaHb/ngrok-stable-linux-amd64.zip
!unzip -o ngrok-stable-linux-amd64.zip

# Run background streamlit instance on local port (default 8501)
import subprocess
subprocess.Popen(["streamlit", "run", "app.py", "--server.port", "8501"])

# Authenticate Ngrok & Open Tunnel
!./ngrok authtoken YOUR_NGROK_AUTHTOKEN
from pyngrok import ngrok
pub_url = ngrok.connect(8501, "http")
print("SIFMS Live Streamlit deployment is ready at:", pub_url)`}
                  </pre>
                </div>
              </div>
            </div>

            {/* Step 5 */}
            <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/50 hover:bg-slate-800 transition duration-200">
              <div className="flex gap-3">
                <span className="flex-shrink-0 h-7 w-7 rounded-lg bg-amber-500/20 text-amber-400 font-mono font-bold text-sm flex items-center justify-center border border-amber-500/30">
                  5
                </span>
                <div>
                  <h4 className="font-medium text-slate-200 text-sm font-sans mb-1">
                    Automated GitHub Sync Script
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed font-light">
                    Run the interactive Git companion in Colab to publish your repository to <code className="text-amber-400 bg-slate-950 px-1 py-0.5 rounded text-[10px]">mlimi-Smart-Ai</code> automatically:
                  </p>
                  <pre className="bg-slate-950 p-2 rounded-lg text-amber-400 text-[10px] font-mono mt-2 border border-slate-800 overflow-x-auto">
                    {`# Secures configuration, initializes repository, commits and pushes cleanly
import os
import sys
from getpass import getpass

print("🚀 Mlimi Smart AI - GitHub Sync")
pat = getpass('🔑 Enter GitHub PAT Token: ').strip()
if not pat: sys.exit('❌ Error: Token Required.')

os.system('git config --global user.name "Ha-200519"')
os.system('git config --global user.email "harrymwachande637@gmail.com"')
os.system('git config --global init.defaultBranch main')

if not os.path.exists('.git'): os.system('git init')
os.system('git add .')

os.system('git commit -m "Automated SIFMS backup from MLIMI SMART AI"')
os.system('git remote remove origin 2>/dev/null')
os.system(f'git remote add origin https://Ha-200519:{pat}@github.com/Ha-200519/mlimi-Smart-Ai.git')

print("📤 Pushing to main branch...")
if os.system('git push -u origin main --force') == 0:
    print('✅ Success: https://github.com/Ha-200519/mlimi-Smart-Ai')
else:
    print('❌ Push Failed. Verify token permissions.')`}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Code Block Workspace */}
        <div className="lg:col-span-7 flex flex-col h-[520px] bg-slate-950 rounded-xl border border-slate-800 overflow-hidden">
          {/* Code Header Controls */}
          <div className="flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-slate-800">
            <span className="text-xs font-mono text-slate-400 flex items-center gap-2">
              <Code className="h-4 w-4 text-teal-400" /> app.py (Multi-Level Streamlit Core Node)
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                id="copy-code-btn"
                className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition"
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-400" /> Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" /> Copy Code
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Interactive Code Viewer */}
          <div className="p-4 overflow-y-auto flex-1 font-mono text-xs text-emerald-400/90 leading-relaxed select-all scrollbar-thin scrollbar-thumb-slate-800">
            <pre className="whitespace-pre">{colabPythonCode}</pre>
          </div>
        </div>
      </div>
    </div>
  );
}
