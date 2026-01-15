import { ref } from 'vue'

export function useCurrency() {
    const formatCurrency = (value) => {
        if (value === undefined || value === null) return ''
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value)
    }

    return {
        formatCurrency
    }
}
