import { ref, computed } from 'vue'

const STORAGE_KEY = 'itm_card_notes'

// Shared state across the app
const notes = ref({})

// Load from localStorage on init
function loadFromStorage() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored) {
            notes.value = JSON.parse(stored)
        }
    } catch (e) {
        console.warn('Failed to load card notes:', e)
    }
}

// Save to localStorage
function saveToStorage() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(notes.value))
    } catch (e) {
        console.warn('Failed to save card notes:', e)
    }
}

// Initialize on first import
loadFromStorage()

export function useCardNotes() {
    function getNote(cardId) {
        return notes.value[cardId] || null
    }

    function hasNote(cardId) {
        return !!notes.value[cardId]
    }

    function setNote(cardId, text, badge = null) {
        if (!text || text.trim() === '') {
            deleteNote(cardId)
            return
        }

        notes.value[cardId] = {
            text: text.trim(),
            badge,
            updatedAt: Date.now()
        }
        saveToStorage()
    }

    function deleteNote(cardId) {
        if (notes.value[cardId]) {
            delete notes.value[cardId]
            // Trigger reactivity
            notes.value = { ...notes.value }
            saveToStorage()
        }
    }

    const allNotes = computed(() => {
        return Object.entries(notes.value).map(([cardId, note]) => ({
            cardId,
            ...note
        }))
    })

    const noteCount = computed(() => Object.keys(notes.value).length)

    function exportNotes() {
        const data = JSON.stringify(notes.value, null, 2)
        const blob = new Blob([data], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'itm-card-notes.json'
        a.click()
        URL.revokeObjectURL(url)
    }

    function importNotes(jsonString) {
        try {
            const imported = JSON.parse(jsonString)
            notes.value = { ...notes.value, ...imported }
            saveToStorage()
            return true
        } catch (e) {
            console.error('Failed to import notes:', e)
            return false
        }
    }

    function clearAllNotes() {
        notes.value = {}
        saveToStorage()
    }

    return {
        notes,
        getNote,
        hasNote,
        setNote,
        deleteNote,
        allNotes,
        noteCount,
        exportNotes,
        importNotes,
        clearAllNotes
    }
}
