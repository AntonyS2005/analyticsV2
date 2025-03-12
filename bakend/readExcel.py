from fastapi import FastAPI, File, UploadFile, Form
import pandas as pd
import io

app = FastAPI()

def es_numero(num):
    try:
        if pd.isna(num):
            return False
        float(num)
        return True
    except Exception:
        return False

def leer_datos(buffer_archivo, nombre_hoja):
    ter_fila = False
    n_fila = -1
    datos = []

    excel_data = pd.read_excel(buffer_archivo, sheet_name=nombre_hoja)
    max_filas, max_columnas = excel_data.shape
    
    while not ter_fila:
        n_fila += 1
        if n_fila >= max_filas:
            break
        n_columnas = -1
        ter_columna = False
        
        while not ter_columna:
            n_columnas += 1
            if n_columnas >= max_columnas:
                break
            dato = excel_data.iloc[n_fila, n_columnas]

            if es_numero(dato):
                datos.append(float(dato))
            
            if n_columnas + 1 >= max_columnas or not es_numero(excel_data.iloc[n_fila, n_columnas + 1]):
                ter_columna = True
        
        if n_fila + 1 >= max_filas or not es_numero(excel_data.iloc[n_fila + 1, 0]):
            ter_fila = True

    datos.sort()
    return datos

@app.post("/procesar_excel/")
async def procesar_excel(archivo: UploadFile = File(...), nombre_hoja: str = Form(...)):
    contenido = await archivo.read()
    buffer = io.BytesIO(contenido)
    resultado = leer_datos(buffer, nombre_hoja)
    return {"datos": resultado}
