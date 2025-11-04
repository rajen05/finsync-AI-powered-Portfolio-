import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Transaction, AssetType, TransactionType } from '../types'
import { useAuth } from '../context/AuthContext'

export const useTransactions = () => {
  const { user } = useAuth()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch transactions from database
  const fetchTransactions = async () => {
    if (!user) {
      setTransactions([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })

      if (error) throw error

      // Transform database format to app format
      const transformedTransactions: Transaction[] = (data || []).map(tx => ({
        id: tx.id,
        ticker: tx.ticker,
        assetType: tx.asset_type as AssetType,
        type: tx.transaction_type as TransactionType,
        quantity: parseFloat(tx.quantity),
        price: parseFloat(tx.price),
        date: tx.date,
        broker: tx.broker || undefined,
        notes: tx.notes || undefined,
      }))

      setTransactions(transformedTransactions)
      setError(null)
    } catch (err: any) {
      console.error('Error fetching transactions:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Add transaction to database
  const addTransaction = async (newTransaction: Omit<Transaction, 'id'>) => {
    if (!user) {
      setError('User not authenticated')
      return
    }

    try {
      const { data, error } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          ticker: newTransaction.ticker,
          asset_type: newTransaction.assetType,
          transaction_type: newTransaction.type,
          quantity: newTransaction.quantity,
          price: newTransaction.price,
          date: newTransaction.date,
          broker: newTransaction.broker || null,
          notes: newTransaction.notes || null,
        })
        .select()
        .single()

      if (error) throw error

      // Refresh transactions
      await fetchTransactions()
    } catch (err: any) {
      console.error('Error adding transaction:', err)
      setError(err.message)
      throw err
    }
  }

  // Delete transaction from database
  const deleteTransaction = async (id: string) => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) throw error

      // Refresh transactions
      await fetchTransactions()
    } catch (err: any) {
      console.error('Error deleting transaction:', err)
      setError(err.message)
      throw err
    }
  }

  // Update transaction in database
  const updateTransaction = async (id: string, updates: Partial<Transaction>) => {
    if (!user) return

    try {
      const dbUpdates: any = {}
      if (updates.ticker) dbUpdates.ticker = updates.ticker
      if (updates.assetType) dbUpdates.asset_type = updates.assetType
      if (updates.type) dbUpdates.transaction_type = updates.type
      if (updates.quantity) dbUpdates.quantity = updates.quantity
      if (updates.price) dbUpdates.price = updates.price
      if (updates.date) dbUpdates.date = updates.date
      if (updates.broker !== undefined) dbUpdates.broker = updates.broker
      if (updates.notes !== undefined) dbUpdates.notes = updates.notes

      const { error } = await supabase
        .from('transactions')
        .update(dbUpdates)
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) throw error

      // Refresh transactions
      await fetchTransactions()
    } catch (err: any) {
      console.error('Error updating transaction:', err)
      setError(err.message)
      throw err
    }
  }

  // Fetch transactions when user changes
  useEffect(() => {
    fetchTransactions()
  }, [user])

  return {
    transactions,
    loading,
    error,
    addTransaction,
    deleteTransaction,
    updateTransaction,
    refetch: fetchTransactions,
  }
}
