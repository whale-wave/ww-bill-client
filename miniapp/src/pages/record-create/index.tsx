import { useRef, useState } from 'react'
import { Button, Input, Picker, Text, View } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { money, normalizeAmount } from '@ww-bill/bill-core'
import type { RecordType } from '../../entities/category/api'
import { useCategories } from '../../entities/category/queries'
import { chartKeys } from '../../entities/chart/queries'
import { createRecord } from '../../entities/record/api'
import { recordKeys } from '../../entities/record/queries'
import { userKeys } from '../../entities/user/queries'
import { useAuthGate } from '../../features/auth/use-auth-gate'
import { dateKey } from '../../shared/lib/date'
import { errorMessage } from '../../shared/lib/errors'
import './index.scss'

function currentTime(): string {
  const date = new Date()
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

export default function RecordCreatePage() {
  const isAuthenticated = useAuthGate()
  const [recordType, setRecordType] = useState<RecordType>('sub')
  const [amount, setAmount] = useState('')
  const [remark, setRemark] = useState('')
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null)
  const [selectedDate, setSelectedDate] = useState(() => dateKey(new Date()))
  const [selectedTime, setSelectedTime] = useState(currentTime)
  const [formError, setFormError] = useState('')
  const isSubmitting = useRef(false)
  const queryClient = useQueryClient()
  const categoriesQuery = useCategories(recordType, isAuthenticated)
  const selectedCategory = categoriesQuery.data?.find(category => category.id === selectedCategoryId)
  const createMutation = useMutation({ mutationFn: createRecord })

  function handleRecordType(nextType: RecordType) {
    setRecordType(nextType)
    setSelectedCategoryId(null)
    setFormError('')
  }

  function handleAmount(value: string) {
    setAmount(previous => normalizeAmount(value, previous))
    setFormError('')
  }

  async function handleSubmit() {
    if (isSubmitting.current)
      return
    if (!/^\d+(?:\.\d{1,2})?$/.test(amount) || money.compare(amount, '0') <= 0) {
      setFormError('请输入大于 0、最多两位小数的金额')
      return
    }
    if (!selectedCategory) {
      setFormError('请选择分类')
      return
    }
    const occurredAt = new Date(`${selectedDate}T${selectedTime}:00`)
    if (Number.isNaN(occurredAt.getTime())) {
      setFormError('请选择有效的日期和时间')
      return
    }
    isSubmitting.current = true
    setFormError('')
    try {
      await createMutation.mutateAsync({
        amount: money.format(amount),
        categoryId: selectedCategory.id,
        remark: remark.trim() || selectedCategory.name,
        time: occurredAt.toISOString(),
        type: recordType,
      })
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: recordKeys.all }),
        queryClient.invalidateQueries({ queryKey: chartKeys.all }),
        queryClient.invalidateQueries({ queryKey: userKeys.info }),
      ])
      await Taro.navigateBack()
    }
    catch (error) {
      setFormError(errorMessage(error))
    }
    finally {
      isSubmitting.current = false
    }
  }

  return (
    <View className='page create-page'>
      <Text className='page__title'>记一笔</Text>
      <View className='create-type'>
        <View className={recordType === 'sub' ? 'is-active' : ''} onClick={() => handleRecordType('sub')}>支出</View>
        <View className={recordType === 'add' ? 'is-active' : ''} onClick={() => handleRecordType('add')}>收入</View>
      </View>
      <Text className='section-title'>选择分类</Text>
      {categoriesQuery.isLoading && <View className='state-panel'>正在加载分类…</View>}
      {categoriesQuery.isError && <View className='state-panel'><Text className='error-text'>{errorMessage(categoriesQuery.error)}</Text><Button className='button button--plain' onClick={() => void categoriesQuery.refetch()}>重试</Button></View>}
      {!categoriesQuery.isLoading && !categoriesQuery.isError && !categoriesQuery.data?.length && <View className='state-panel'>暂无可用分类</View>}
      <View className='create-categories'>
        {categoriesQuery.data?.map(category => (
          <View key={category.id} className={`create-categories__item ${selectedCategoryId === category.id ? 'is-active' : ''}`} onClick={() => setSelectedCategoryId(category.id)}>
            <Text className='create-categories__mark'>{category.name.slice(0, 1)}</Text>
            <Text>{category.name}</Text>
          </View>
        ))}
      </View>
      <View className='card create-form'>
        <Text className='muted'>金额</Text>
        <Input className='input-field create-form__amount' type='digit' value={amount} placeholder='0.00' onInput={event => handleAmount(event.detail.value)} />
        <Text className='muted'>备注</Text>
        <Input className='input-field' value={remark} placeholder={selectedCategory?.name ?? '选填'} onInput={event => setRemark(event.detail.value)} />
        <View className='row create-form__pickers'>
          <Picker mode='date' value={selectedDate} end={dateKey(new Date())} onChange={event => setSelectedDate(event.detail.value)}><View>{selectedDate}</View></Picker>
          <Picker mode='time' value={selectedTime} onChange={event => setSelectedTime(event.detail.value)}><View>{selectedTime}</View></Picker>
        </View>
        {formError && <Text className='error-text'>{formError}</Text>}
        <Button className='button' loading={createMutation.isLoading} disabled={createMutation.isLoading} onClick={handleSubmit}>完成</Button>
      </View>
    </View>
  )
}
