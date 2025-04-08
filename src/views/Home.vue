<template>
  <div class="ahp-calculator p-4">
    <div class="input">
      <!-- ======================
         AHP Input Table
         ====================== -->
      <div class="inputTable">
        <h3>Bias Table</h3>
        <table class="AHP-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Prioritäten</th>
              <th>Um wieviel mehr?</th>
              <th>Priorität</th>
              <th>Rang</th>
              <th>+</th>
              <th>-</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, index) in rows" :key="row.id">
              <td>{{ index + 1 }}</td>
              <td>
                <input type="text" v-model="row.name" :placeholder="`Priorität ${row.id} (Schreib was rein)`"
                  class="text-input" />
              </td>
              <td>
                <!-- Render radio buttons from our available options -->
                <template v-for="option in ratingOptions" :key="option">
                  <input type="radio" :id="`prio_${row.id}_${option}`" :name="`prio_${row.id}`" :value="option"
                    v-model.number="row.rating" />
                  <label :for="`prio_${row.id}_${option}`">{{ option }}</label>
                </template>
              </td>
              <!-- Priority % -->
              <td>{{ computedPriorities[index].toFixed(1) }} %</td>
              <!-- Rank with background color for #1 -->
              <td :style="{ backgroundColor: getRankColor(rowRanks[row.id]) }">
                {{ rowRanks[row.id] }}
              </td>
              <!-- “Plus” & “Minus” columns -->
              <td>{{ (computedPriorities[index] - minPriority).toFixed(1) }} %</td>
              <td>{{ (maxPriority - computedPriorities[index]).toFixed(1) }} %</td>
            </tr>
          </tbody>
        </table>

        <!-- Buttons -->
        <div class="button-group my-4">
          <button @click="addRow" class="btn">+ Zeile Hinzufügen</button>
          <button @click="addIncrement" class="btn">+ Skala Hinzufügen</button>
        </div>
      </div>

      <!-- ======================
         Dynamic AHP Skala
         ====================== -->
      <div class="legend my-4">
        <h2>AHP Skala</h2>
        <ul>
          <li v-for="option in ratingOptions" :key="option">
            <strong>{{ option }}</strong> - {{ ratingDescriptions[option] || 'No Description' }}
          </li>
        </ul>
      </div>
    </div>
    <div class="output">
      <!-- ======================
         Decision Matrix
         ====================== -->
      <div class="decisionMatrix my-4">
        <h3>Entscheidungsmatrix (Pairwise Ratios)</h3>
        <table class="matrix-table">
          <thead>
            <tr>
              <th></th>
              <th v-for="(colRow, colIndex) in rows" :key="colRow.id">
                {{ colRow.name.trim() !== '' ? colRow.name : `C${colRow.id}` }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(r, rowIndex) in rows" :key="r.id">
              <!-- Row header -->
              <th>{{ r.name.trim() !== '' ? r.name : `C${r.id}` }}</th>
              <!-- Matrix cells -->
              <td v-for="(c, colIndex) in rows" :key="c.id" :style="{
                backgroundColor: rowIndex === colIndex ? '#e8f1fa' : 'white',
                color: rowIndex !== colIndex ? 'green' : 'black',
              }">
                {{ matrix[rowIndex][colIndex].toFixed(2) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- ======================
         Highcharts Chart
         ====================== -->
      <div class="ouputDecisionChart my-4">
        <h3>Entscheidungs Prioritäten</h3>
        <div ref="chartContainer" class="chart-container"></div>
      </div>
      <div class="outputButtons">
        <button>Export .xls</button>
        <button>Export .csv</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watchEffect, onMounted, nextTick } from 'vue'
import Highcharts from 'highcharts'

/**
 * DYNAMIC ROWS
 * Each row => { id, name, rating }
 * Default rating is 3
 */
const rows = ref([
  { id: 1, name: '', rating: 3 },
  { id: 2, name: '', rating: 3 },
  { id: 3, name: '', rating: 3 },
])
let nextId = rows.value.length + 1

/**
 * DYNAMIC RATING OPTIONS
 * Defaults: 1–5
 * Add new increments on click of +Add Increment
 */
const ratingOptions = ref([1, 2, 3, 4, 5])

/**
 * RATING DESCRIPTIONS
 * Maps rating => textual meaning
 * If user adds a rating of 6 or more, you could
 * add more descriptions or fallback to "No Description"
 */
const ratingDescriptions = {
  1: 'Gleiche Bedeutung',
  2: 'Etwas grössere Bedeutung',
  3: 'Erheblich grössere Bedeutung',
  4: 'Sehr viel grössere Bedeutung',
  5: 'Absolut dominierend',
}

/**
 * COMPUTED: Priorities
 * Priority (%) = (rating / sum of all ratings) * 100
 */
const totalRating = computed(() => rows.value.reduce((acc, row) => acc + row.rating, 0))
const computedPriorities = computed(() =>
  rows.value.map(row => (row.rating / totalRating.value) * 100)
)

/**
 * MIN / MAX priority values
 */
const minPriority = computed(() => Math.min(...computedPriorities.value))
const maxPriority = computed(() => Math.max(...computedPriorities.value))

/**
 * RANKS
 * #1 for the highest priority, #2 for second highest, etc.
 */
const rowRanks = computed(() => {
  // Pair each row with its priority
  const rowWithPrio = rows.value.map((row, i) => ({
    id: row.id,
    priority: computedPriorities.value[i],
  }))
  // Sort by priority descending
  rowWithPrio.sort((a, b) => b.priority - a.priority)
  // Assign rank => 1,2,3,...
  const rankMap = {}
  rowWithPrio.forEach((item, idx) => {
    rankMap[item.id] = idx + 1
  })
  return rankMap
})

/**
 * GET RANK COLOR
 * Example mapping: #1 => gold, #2 => silver, #3 => bronze, else => lightgray
 * Adjust as you like
 */
function getRankColor(rank) {
  switch (rank) {
    case 1:
      return 'gold'
    case 2:
      return 'silver'
    case 3:
      return '#cd7f32' // bronze
    default:
      return 'lightgray'
  }
}

/**
 * DECISION MATRIX
 * We’ll create an NxN matrix of pairwise ratios: rating_i / rating_j
 * The diagonal is always 1. Watch rows for changes, recalc dynamically.
 */
const matrix = ref([])

watchEffect(() => {
  const n = rows.value.length
  matrix.value = Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) => {
      if (i === j) return 1
      return rows.value[i].rating / rows.value[j].rating
    })
  )
})

/**
 * ACTIONS
 */
const addRow = () => {
  rows.value.push({ id: nextId, name: '', rating: 3 })
  nextId++
}
const addIncrement = () => {
  const lastOption = ratingOptions.value[ratingOptions.value.length - 1]
  ratingOptions.value.push(lastOption + 1)
  // Optionally add a fallback description if you want
  // ratingDescriptions[lastOption + 1] = 'Custom Description'
}

/**
 * HIGHCHARTS
 * We'll color each bar according to the rank color
 */
const chartContainer = ref(null)
let chart = null

// Function to (re)draw the chart
const drawChart = () => {
  if (!chartContainer.value || rows.value.length === 0) return

  // Data => computed priorities
  const data = computedPriorities.value.map(val => +val.toFixed(2))
  // Categories => row names or placeholders
  const categories = rows.value.map(row =>
    row.name.trim() !== '' ? row.name : `Priorität ${row.id}`
  )
  // Assign bar colors by rank
  const barColors = rows.value.map(row => getRankColor(rowRanks.value[row.id]))

  // If chart doesn't exist, create it
  if (!chart) {
    chart = Highcharts.chart(chartContainer.value, {
      chart: { type: 'column' },
      title: { text: null },
      legend: {
        enabled: false,
      },
      credits: {
        enabled: false,
      },
      xAxis: {
        categories, labels: {
          y: -10,
          style: {
            fontSize: "14px",
          },
        },
      },
      yAxis: {
        min: 0,
        title: { text: 'Priority (%)' },
        labels: {
          align: "inside",
          x: 20,
          style: {
            fontSize: "14px",
          },
        },
      },
      plotOptions: {
        column: {
          colorByPoint: true, // so each bar can have a different color
        },
      },
      series: [
        {
          name: 'Priority',
          data,
          colors: barColors, // color each bar individually
        },
      ],
    })
  } else {
    // Update existing chart data & categories
    chart.xAxis[0].setCategories(categories)
    chart.series[0].setData(data)
    // Also update bar colors
    chart.series[0].update({ colors: barColors })
  }
}

// Only create chart after DOM is ready
onMounted(async () => {
  await nextTick()
  if (rows.value.length > 0 && chartContainer.value) {
    drawChart()
  }
})

// Redraw chart whenever data changes
watchEffect(() => {
  if (rows.value.length > 0 && chartContainer.value) {
    drawChart()
  }
})

</script>

<style scoped>
/* Table styles */
.AHP-table {
  width: 100%;
  border-collapse: collapse;
}

.AHP-table th,
.AHP-table td {
  border: 1px solid #ccc;
  padding: 0.5rem;
  text-align: center;
}

.text-input {
  width: 100%;
  padding: 0.25rem;
}

/* Decision Matrix table */
.matrix-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
  height: 100%;
}

.matrix-table th,
.matrix-table td {
  border: 1px solid #ccc;
  padding: 0.5rem;
  text-align: center;
}

/* Buttons */
.btn {
  padding: 0.5rem 1rem;
  margin-right: 0.5rem;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.legend {
  ul {
    list-style-type: none;
    text-align: left;
  }
}

/* Chart container */
.chart-container {
  width: 100%;
  height: 400px;
}

/* Optional styling for the #1 rank cell colors, etc. */
.ahp-calculator {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  grid-gap: 20px;
}

.input {
  grid-column: span 6;
}

.output {
  grid-column: span 6;
  min-height: 100vh;
}
</style>
