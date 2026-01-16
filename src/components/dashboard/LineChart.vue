<template>
  <Line :data="chartData" :options="chartOptions" />
</template>

<script setup>
import { computed } from 'vue'
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

const props = defineProps({
  labels: {
    type: Array,
    required: true
  },
  data: {
    type: Array,
    required: true
  },
  label: {
    type: String,
    default: 'Ventas'
  }
})

const chartData = computed(() => ({
  labels: props.labels,
  datasets: [
    {
      label: props.label,
      data: props.data,
      borderColor: '#6366f1', // Indigo-500
      backgroundColor: (context) => {
        const ctx = context.chart.ctx
        const gradient = ctx.createLinearGradient(0, 0, 0, 300)
        gradient.addColorStop(0, 'rgba(99, 102, 241, 0.3)')
        gradient.addColorStop(0.5, 'rgba(99, 102, 241, 0.1)')
        gradient.addColorStop(1, 'rgba(99, 102, 241, 0)')
        return gradient
      },
      fill: true,
      tension: 0.4,
      borderWidth: 3,
      pointBackgroundColor: '#6366f1',
      pointBorderColor: '#fff',
      pointBorderWidth: 3,
      pointRadius: 5,
      pointHoverRadius: 8,
      pointHoverBackgroundColor: '#6366f1',
      pointHoverBorderColor: '#fff',
      pointHoverBorderWidth: 3,
      shadowOffsetX: 0,
      shadowOffsetY: 4,
      shadowBlur: 10,
      shadowColor: 'rgba(99, 102, 241, 0.3)'
    }
  ]
}))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    mode: 'index',
    intersect: false
  },
  plugins: {
    legend: {
      display: false
    },
    tooltip: {
      enabled: true,
      backgroundColor: 'rgba(15, 23, 42, 0.95)',
      padding: 16,
      borderRadius: 12,
      borderColor: 'rgba(99, 102, 241, 0.3)',
      borderWidth: 1,
      titleColor: '#f1f5f9',
      titleFont: {
        size: 14,
        weight: '600',
        family: "'Inter', sans-serif"
      },
      bodyColor: '#cbd5e1',
      bodyFont: {
        size: 13,
        family: "'Inter', sans-serif"
      },
      displayColors: false,
      callbacks: {
        title: (context) => {
          return context[0].label
        },
        label: (context) => {
          const value = context.parsed.y
          return `Ingresos: $${value.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
        }
      }
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      grid: {
        color: 'rgba(148, 163, 184, 0.1)',
        lineWidth: 1,
        drawBorder: false
      },
      border: {
        display: false
      },
      ticks: {
        color: '#64748b',
        font: {
          size: 12,
          family: "'Inter', sans-serif"
        },
        padding: 8,
        callback: (value) => {
          return `$${value.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
        }
      }
    },
    x: {
      grid: {
        display: false,
        drawBorder: false
      },
      border: {
        display: false
      },
      ticks: {
        color: '#64748b',
        font: {
          size: 12,
          family: "'Inter', sans-serif"
        },
        padding: 8,
        maxRotation: 0,
        autoSkip: true,
        autoSkipPadding: 20
      }
    }
  },
  elements: {
    line: {
      borderJoinStyle: 'round'
    }
  }
}

</script>
