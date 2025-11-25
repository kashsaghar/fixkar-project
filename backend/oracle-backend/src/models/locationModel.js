const connect = require("../config/db")
const oracledb = require("oracledb")

// Get all locations
const getAllLocations = async () => {
  const conn = await connect()
  try {
    const result = await conn.execute(
      `SELECT DISTINCT location FROM services WHERE location IS NOT NULL ORDER BY location`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT },
    )
    const locations = result.rows.map((row) => row.location)

    // Return default list if no locations found
    if (locations.length === 0) {
      return [
        "Clifton",
        "Defence",
        "Gulshan-e-Iqbal",
        "Gulistan-e-Johar",
        "North Nazimabad",
        "Federal B Area",
        "Saddar",
        "Malir",
        "Korangi",
        "Landhi",
        "Orangi Town",
        "Nazimabad",
        "PECHS",
        "Bahadurabad",
        "Tariq Road",
        "Shahrah-e-Faisal",
        "Liaquatabad",
        "North Karachi",
        "Shah Faisal Colony",
        "Model Colony",
        "Kemari",
        "Lyari",
        "Baldia Town",
        "Bin Qasim Town",
        "Gadap Town",
      ]
    }
    return locations
  } finally {
    await conn.close()
  }
}

module.exports = {
  getAllLocations,
}
