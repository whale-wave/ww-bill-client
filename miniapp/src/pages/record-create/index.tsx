import { Fragment, useMemo, useRef, useState } from 'react'
import { Input, Picker, Text, View } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { isDarkCategoryBackground, groupCategoriesByParent, money, normalizeAmount } from '@ww-bill/bill-core'
import { RecordAmountVisual, RecordEntryRow, CategoryChoiceVisual, type CategoryChoicePrimitives } from '@ww-bill/bill-ui'
import { useCategories, type RecordType } from '../../entities/category'
import { useAuthGate } from '../../features/auth'
import { useCreateRecord } from '../../features/record-create'
import { dateKey, shanghaiDateTimeToIso, timeKey } from '../../shared/lib/date'
import { errorMessage } from '../../shared/lib/errors'
import { Surface } from '../../shared/ui/surface'
import { AppButton } from '../../shared/ui/app-button'
import { CategoryIcon } from '../../shared/ui/category-icon'
import './index.scss'

const categoryPrimitives: CategoryChoicePrimitives = { Box: View, Text }

export default function RecordCreatePage() {
  const isAuthenticated = useAuthGate()
  const [recordType, setRecordType] = useState<RecordType>('sub')
  const [amount, setAmount] = useState('')
  const [remark, setRemark] = useState('')
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null)
  const [expandedParentId, setExpandedParentId] = useState<number | null>(null)
  const [selectedDate, setSelectedDate] = useState(() => dateKey(new Date()))
  const [selectedTime, setSelectedTime] = useState(() => timeKey(new Date()))
  const [formError, setFormError] = useState('')
  const isSubmitting = useRef(false)
  const categoriesQuery = useCategories({ params: { recordType }, queryOptions: { enabled: isAuthenticated } })
  const categories = categoriesQuery.data ?? []
  const { roots: rootCategories, childrenByParent } = useMemo(
    () => groupCategoriesByParent(categoriesQuery.data ?? []),
    [categoriesQuery.data],
  )
  const selectedCategory = categories.find(category => category.id === selectedCategoryId)
  const createMutation = useCreateRecord()

  function handleRecordType(nextType: RecordType) {
    setRecordType(nextType)
    setSelectedCategoryId(null)
    setExpandedParentId(null)
    setFormError('')
  }

  function handleRootCategory(categoryId: number) {
    if (childrenByParent.has(categoryId)) {
      setExpandedParentId(current => current === categoryId ? null : categoryId)
      return
    }
    setSelectedCategoryId(categoryId)
    setExpandedParentId(null)
  }

  function handleSelectCategory(categoryId: number) {
    setSelectedCategoryId(categoryId)
    setExpandedParentId(null)
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
    const occurredAt = shanghaiDateTimeToIso(selectedDate, selectedTime)
    if (!occurredAt) {
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
        time: occurredAt,
        type: recordType,
      })
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
      {categoriesQuery.isError && <View className='state-panel'><Text className='error-text'>{errorMessage(categoriesQuery.error)}</Text><AppButton variant='secondary' onClick={() => void categoriesQuery.refetch()}>重试</AppButton></View>}
      {!categoriesQuery.isLoading && !categoriesQuery.isError && !categoriesQuery.data?.length && <View className='state-panel'>暂无可用分类</View>}
      <View className='create-categories'>
        {rootCategories.map(category => {
          const children = childrenByParent.get(category.id) ?? []
          return (
            <Fragment key={category.id}>
              <View className={`create-categories__item ${selectedCategoryId === category.id || expandedParentId === category.id ? 'is-active' : ''}`} onClick={() => handleRootCategory(category.id)}>
                <CategoryChoiceVisual
                  hasChildren={children.length > 0}
                  icon={<CategoryIcon categoryName={category.name} iconKey={category.icon} iconType={category.iconType} textIconEnabled={category.textIconEnabled} textIconIndex={category.textIconIndex} size={24} color={isDarkCategoryBackground(category.backgroundColor) ? '#fff' : undefined} />}
                  iconStyle={category.backgroundColor ? { backgroundColor: category.backgroundColor } : undefined}
                  isSelected={selectedCategoryId === category.id || expandedParentId === category.id}
                  label={category.name}
                  primitives={categoryPrimitives}
                />
              </View>
              {expandedParentId === category.id && (
                <View className='create-categories__children'>
                  <View className='create-categories__item' onClick={() => handleSelectCategory(category.id)}>
                    <CategoryChoiceVisual
                      hint='直接记入'
                      icon={<CategoryIcon categoryName={category.name} iconKey={category.icon} iconType={category.iconType} textIconEnabled={category.textIconEnabled} textIconIndex={category.textIconIndex} size={24} color={isDarkCategoryBackground(category.backgroundColor) ? '#fff' : undefined} />}
                      iconStyle={category.backgroundColor ? { backgroundColor: category.backgroundColor } : undefined}
                      isSelected={selectedCategoryId === category.id}
                      label={category.name}
                      primitives={categoryPrimitives}
                    />
                  </View>
                  {children.map(child => (
                    <View key={child.id} className={`create-categories__item ${selectedCategoryId === child.id ? 'is-active' : ''}`} onClick={() => handleSelectCategory(child.id)}>
                      <CategoryChoiceVisual
                        icon={<CategoryIcon categoryName={child.name} iconKey={child.icon} iconType={child.iconType} textIconEnabled={child.textIconEnabled} textIconIndex={child.textIconIndex} size={24} color={isDarkCategoryBackground(child.backgroundColor) ? '#fff' : undefined} />}
                        iconStyle={child.backgroundColor ? { backgroundColor: child.backgroundColor } : undefined}
                        isSelected={selectedCategoryId === child.id}
                        label={child.name}
                        primitives={categoryPrimitives}
                      />
                    </View>
                  ))}
                </View>
              )}
            </Fragment>
          )
        })}
      </View>
      <Surface className='card create-form'>
        <RecordEntryRow
          caption={selectedCategory ? `${selectedCategory.path ?? selectedCategory.name} · ${recordType === 'sub' ? '支出' : '收入'}` : '请选择分类'}
          primitives={{ Box: View, Note: View, Text }}
          noteInput={<Input className='bill-record-entry__note-input' value={remark} placeholder='备注（选填）' onInput={event => setRemark(event.detail.value)} />}
          amountControl={(
            <View className='bill-record-entry__amount-control'>
              <RecordAmountVisual
                value={amount || '0.00'}
                primitives={{ Box: View, Text }}
                digits={fontSize => <Input className='bill-record-amount__input' style={{ width: `${Math.max(4, amount.length + 1) * fontSize * 0.65}px` }} type='digit' value={amount} placeholder='0.00' onInput={event => handleAmount(event.detail.value)} />}
              />
            </View>
          )}
        />
        <View className='row create-form__pickers'>
          <Picker mode='date' value={selectedDate} end={dateKey(new Date())} onChange={event => setSelectedDate(event.detail.value)}><View>{selectedDate}</View></Picker>
          <Picker mode='time' value={selectedTime} onChange={event => setSelectedTime(event.detail.value)}><View>{selectedTime}</View></Picker>
        </View>
        {formError && <Text className='error-text'>{formError}</Text>}
        <AppButton loading={createMutation.isLoading} disabled={createMutation.isLoading} onClick={handleSubmit}>完成</AppButton>
      </Surface>
    </View>
  )
}
