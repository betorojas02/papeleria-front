<template>
  <Bar :data="chartData" :options="chartOptions" />
</template>

<script setup>
import { computed } from 'vue'
import { Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
)

const props = defineProps({
  data: {
    type: Array,
    required: true
  }
})

const methodLabels = {
  cash: 'Efectivo',
  card: 'Tarjeta',
  transfer: 'Transferencia',
  other: 'Otro'
}

const methodColors = {
  cash: '#10b981',
  card: '#6366f1',
  transfer: '#f59e0b',
  other: '#64748b'
}

const chartData = computed(() => ({
  labels: props.data.map(item => methodLabels[item.method] || item.method),
  datasets: [
    {
      label: 'Total',
      data: props.data.map(item => item.total),
      backgroundColor: props.data.map(item => methodColors[item.method] || '#64748b'),
      borderRadius: 8,
      barThickness: 40
    }
  ]
}))

const chartOptions = {
  indexAxis: 'y',
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false
    },
    tooltip: {
      backgroundColor: 'rgba(15, 23, 42, 0.95)',
      padding: 12,
      borderRadius: 8,
      titleFont: {
        size: 13,
        weight: '600'
      },
      bodyFont: {
        size: 12
      },
      callbacks: {
        label: (context) => {
          const value = context.parsed.x
          return `Total: $${value.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
        }
      }
    }
  },
  scales: {
    x: {
      beginAtZero: true,
      grid: {
        color: 'rgba(148, 163, 184, 0.1)',
        drawBorder: false
      },
      border: {
        display: false
      },
      ticks: {
        color: '#64748b',
        font: {
          size: 11
        },
        callback: (value) => {
          return `$${value.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
        }
      }
    },
    y: {
      grid: {
        display: false,
        drawBorder: false
      },
      border: {
        display: false
      },
      ticks: {
        color: '#1e293b',
        font: {
          size: 13,
          weight: '600'
        }
      }
    }
  }
}
</script>
