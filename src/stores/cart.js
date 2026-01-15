import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useCartStore = defineStore('cart', () => {
    const items = ref([])
    const customer = ref(null)
    const payments = ref([]) // NEW: Array of payment methods

    const total = computed(() => {
        return items.value.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    })

    const itemCount = computed(() => {
        return items.value.reduce((sum, item) => sum + item.quantity, 0)
    })

    // NEW: Total paid across all payment methods
    const totalPaid = computed(() => {
        return payments.value.reduce((sum, payment) => sum + payment.amount, 0)
    })

    // NEW: Remaining amount to be paid
    const remainingAmount = computed(() => {
        return total.value - totalPaid.value
    })

    function addItem(product, quantity = 1) {
        const existingItem = items.value.find(item => item.id === product.id)

        if (existingItem) {
            existingItem.quantity += quantity
        } else {
            items.value.push({
                id: product.id,
                name: product.name,
                price: product.price,
                quantity,
                stock: product.stock,
            })
        }
    }

    function removeItem(productId) {
        const index = items.value.findIndex(item => item.id === productId)
        if (index > -1) {
            items.value.splice(index, 1)
        }
    }

    function updateQuantity(productId, quantity) {
        const item = items.value.find(item => item.id === productId)
        if (item) {
            item.quantity = quantity
            if (item.quantity <= 0) {
                removeItem(productId)
            }
        }
    }

    function setCustomer(customerData) {
        customer.value = customerData
    }

    // NEW: Add a payment method
    function addPayment(payment) {
        payments.value.push({
            method: payment.method,
            amount: payment.amount,
            voucher: payment.voucher || null
        })
    }

    // NEW: Remove a payment method
    function removePayment(index) {
        payments.value.splice(index, 1)
    }

    // NEW: Clear all payments
    function clearPayments() {
        payments.value = []
    }

    function clear() {
        items.value = []
        customer.value = null
        payments.value = [] // NEW: Clear payments too
    }

    return {
        items,
        customer,
        payments, // NEW
        total,
        itemCount,
        totalPaid, // NEW
        remainingAmount, // NEW
        addItem,
        removeItem,
        updateQuantity,
        setCustomer,
        addPayment, // NEW
        removePayment, // NEW
        clearPayments, // NEW
        clear,
    }
})
