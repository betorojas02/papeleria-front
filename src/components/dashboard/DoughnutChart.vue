<template>
  <Doughnut :data="chartData" :options="chartOptions" />
</template>

<script setup>
import { computed } from 'vue'
import { Doughnut } from 'vue-chartjs'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'

ChartJS.register(ArcElement, Tooltip, Legend)

const props = defineProps({
  data: {
    type: Array,
    required: true
  }
})

const chartData = computed(() => ({
  labels: props.data.map(d => d.category),
  datasets: [
    {
      data: props.data.map(d => d.total),
      backgroundColor: [
        '#14b8a6',
        '#06b6d4',
        '#8b5cf6',
        '#ec4899',
        '#f59e0b',
        '#10b981'
      ],
      borderWidth: 0,
      hoverOffset: 10
    }
  ]
}))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        padding: 15,
        font: {
          size: 12,
          weight: '500'
        },
        usePointStyle: true,
        pointStyle: 'circle'
      }
    },
    tooltip: {
      backgroundColor: '#1e293b',
      padding: 12,
      borderRadius: 8,
      callbacks: {
        label: (context) => {
          const label = context.label || ''
          const value = context.parsed || 0
          const percentage = props.data[context.dataIndex]?.percentage || 0
          return `${label}: $${value.toLocaleString()} (${percentage}%)`
        }
      }
    }
  }
}
</script>
