// Helper to retrieve stored data
function getStoredData () {
  const data = localStorage.getItem('entries')
  return data ? JSON.parse(data) : []
}

// Helper to store data
function storeData (data) {
  localStorage.setItem('entries', JSON.stringify(data))
}

// Render table data
function renderTable () {
  const data = getStoredData()

  // Sort data in descending order by date and time
  data.sort(
    (a, b) => new Date(`${b.date} ${b.time}`) - new Date(`${a.date} ${a.time}`)
  )

  const tableBody = document.getElementById('dataTable')
  tableBody.innerHTML = ''

  data.forEach(entry => {
    const row = document.createElement('tr')
    row.innerHTML = `
      <td>${entry.date}</td>
      <td>${entry.time}</td>
      <td>${entry.text}</td>
    `
    tableBody.appendChild(row)
  })
}

// Handle submit
document.getElementById('submitBtn').addEventListener('click', () => {
  const textInput = document.getElementById('textInput').value.trim()
  if (!textInput) return

  const now = new Date()
  const newEntry = {
    date: now.toLocaleDateString(),
    time: now.toLocaleTimeString(),
    text: textInput
  }

  const data = getStoredData()
  data.push(newEntry)

  // Store and render data after sorting
  storeData(data)
  renderTable()

  document.getElementById('textInput').value = ''
})

// Handle export
document.getElementById('exportBtn').addEventListener('click', () => {
  const data = getStoredData()
  const blob = new Blob([JSON.stringify(data)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)

  const a = document.createElement('a')
  a.href = url
  a.download = 'data.json'
  a.click()

  URL.revokeObjectURL(url)
})

// Handle import
document.getElementById('importBtn').addEventListener('click', () => {
  document.getElementById('fileInput').click()
})

document.getElementById('fileInput').addEventListener('change', event => {
  const file = event.target.files[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = () => {
    try {
      const importedData = JSON.parse(reader.result)
      const existingData = getStoredData()

      // Merge and remove duplicates
      const mergedData = [...existingData, ...importedData]
      const uniqueData = Array.from(
        new Map(
          mergedData.map(entry => [
            `${entry.date} ${entry.time} ${entry.text}`,
            entry
          ])
        ).values()
      )
      uniqueData.sort(
        (a, b) =>
          new Date(`${a.date} ${a.time}`) - new Date(`${b.date} ${b.time}`)
      )

      storeData(uniqueData)
      renderTable()
    } catch (error) {
      alert('Invalid JSON file.')
    }
  }

  reader.readAsText(file)
})

// Initialize table on load
document.addEventListener('DOMContentLoaded', renderTable)
