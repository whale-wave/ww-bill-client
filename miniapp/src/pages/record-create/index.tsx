import { Fragment, useMemo, useRef, useState } from 'react'
import { Button, Input, ScrollView, Text, View } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { isDarkCategoryBackground, groupCategoriesByParent, categoryRowEndIndex, money } from '@ww-bill/bill-core'
import { RecordDetailChipContent, RecordCategoryGrid, RecordCategoryErrorVisual, categoryChoiceClassName, RecordEditorHeader, RecordAmountVisual, RecordEntryRow, CategoryChoiceVisual, type CategoryChoicePrimitives } from '@ww-bill/bill-ui'
import { EmptyState } from '../../shared/ui/empty-state'
import { PageLoadingState } from '../../shared/ui/page-loading-state'
import './index.scss'
import { Page } from '../../shared/ui/page'
import { useCategories, type RecordType } from '../../entities/category'
import { useAuthGate } from '../../features/auth'
import { useCreateRecord } from '../../features/record-create'
import { dateKey, shanghaiDateTimeToIso, timeKey } from '../../shared/lib/date'
import { errorMessage } from '../../shared/lib/errors'
import { DesignIcon } from '../../shared/ui/design-icon'
import { useCalculator } from '../../features/record-create/model/use-calculator'
import { RecordKeypad } from '../../shared/ui/record-keypad'
import { CategoryIcon } from '../../shared/ui/category-icon'
import { DateTimePicker } from '../../shared/ui/date-time-picker'

const categoryPrimitives: CategoryChoicePrimitives = { Box: View, Text }

export default function RecordCreatePage() {
  const isAuthenticated = useAuthGate()
  const [recordType, setRecordType] = useState<RecordType>('sub')
  const calculator = useCalculator()
  const amount = calculator.totals
  const [remark, setRemark] = useState('')
  const [isNoteFocused, setIsNoteFocused] = useState(false)
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null)
  const [expandedParentId, setExpandedParentId] = useState<number | null>(null)
  const [selectedDate, setSelectedDate] = useState(() => dateKey(new Date()))
  const [selectedTime, setSelectedTime] = useState(() => timeKey(new Date(), true))
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false)
  const [formError, setFormError] = useState('')
  const isSubmitting = useRef(false)
  const categoriesQuery = useCategories({ params: { recordType }, queryOptions: { enabled: isAuthenticated } })
  const categories = categoriesQuery.data ?? []
  const { roots: rootCategories, childrenByParent } = useMemo(
    () => groupCategoriesByParent(categoriesQuery.data ?? []),
    [categoriesQuery.data],
  )
  const expandedCategory = rootCategories.find(category => category.id === expandedParentId)
  const expandedChildren = expandedParentId ? childrenByParent.get(expandedParentId) ?? [] : []
  const expandedRowEndIndex = categoryRowEndIndex(rootCategories.findIndex(category => category.id === expandedParentId), rootCategories.length)
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

  function handleAmountFocus() {
    setIsNoteFocused(false)
    void Taro.hideKeyboard().catch(() => undefined)
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
    <Page className='create-page'>
      <RecordEditorHeader
        primitives={{ Header: View, Box: View }}
        back={<Button className='bill-record-back' aria-label='取消' onClick={() => void Taro.navigateBack()}><DesignIcon name='editor-back' size={18} tone='muted' /></Button>}
      >
        <Button className={`bill-record-type${recordType === 'sub' ? ' bill-record-type--expense' : ''}`} onClick={() => handleRecordType('sub')}>支出</Button>
        <Button className={`bill-record-type${recordType === 'add' ? ' bill-record-type--income' : ''}`} onClick={() => handleRecordType('add')}>收入</Button>
      </RecordEditorHeader>
      <ScrollView scrollY className='create-category-viewport'>
      {categoriesQuery.isLoading && <PageLoadingState label='正在加载分类…' />}
      {categoriesQuery.isError && <RecordCategoryErrorVisual primitives={{ Box: View, Text }} label='加载失败' icon={<DesignIcon name='empty-alert' size={17} tone='muted' />} action={<Button className='bill-record-category-error__retry' onClick={() => void categoriesQuery.refetch()}>重试</Button>} />}
      {!categoriesQuery.isLoading && !categoriesQuery.isError && !categoriesQuery.data?.length && <EmptyState title='暂无可用分类' description='请先在 Web 端配置记账分类。' />}
      <View className='create-categories'><RecordCategoryGrid primitive={View}>
        {rootCategories.map((category, index) => {
          const children = childrenByParent.get(category.id) ?? []
          return (
            <Fragment key={category.id}>
              <View className={categoryChoiceClassName(selectedCategoryId === category.id || selectedCategory?.parentId === category.id)} onClick={() => handleRootCategory(category.id)}>
                <CategoryChoiceVisual
                  hasChildren={children.length > 0}
                  icon={<CategoryIcon categoryName={category.name} iconKey={category.icon} iconType={category.iconType} textIconEnabled={category.textIconEnabled} textIconIndex={category.textIconIndex} size={24} color={isDarkCategoryBackground(category.backgroundColor) ? '#fff' : undefined} />}
                  iconStyle={category.backgroundColor ? { backgroundColor: category.backgroundColor } : undefined}
                  isSelected={selectedCategoryId === category.id || selectedCategory?.parentId === category.id}
                  label={category.name}
                  primitives={categoryPrimitives}
                />
              </View>
              {index === expandedRowEndIndex && expandedCategory && (
                <View className='bill-record-category-panel'><RecordCategoryGrid primitive={View} variant='children'>
                  <View className={categoryChoiceClassName(selectedCategoryId === expandedCategory.id)} onClick={() => handleSelectCategory(expandedCategory.id)}>
                    <CategoryChoiceVisual
                      hint='直接记入'
                      iconClassName='bill-category-choice__icon--child'
                      icon={<CategoryIcon categoryName={expandedCategory.name} iconKey={expandedCategory.icon} iconType={expandedCategory.iconType} textIconEnabled={expandedCategory.textIconEnabled} textIconIndex={expandedCategory.textIconIndex} size={24} color={isDarkCategoryBackground(expandedCategory.backgroundColor) ? '#fff' : undefined} />}
                      iconStyle={expandedCategory.backgroundColor ? { backgroundColor: expandedCategory.backgroundColor } : undefined}
                      isSelected={selectedCategoryId === expandedCategory.id}
                      label={expandedCategory.name}
                      primitives={categoryPrimitives}
                    />
                  </View>
                  {expandedChildren.map(child => (
                    <View key={child.id} className={categoryChoiceClassName(selectedCategoryId === child.id)} onClick={() => handleSelectCategory(child.id)}>
                      <CategoryChoiceVisual
                        iconClassName='bill-category-choice__icon--child'
                        icon={<CategoryIcon categoryName={child.name} iconKey={child.icon} iconType={child.iconType} textIconEnabled={child.textIconEnabled} textIconIndex={child.textIconIndex} size={24} color={isDarkCategoryBackground(child.backgroundColor) ? '#fff' : undefined} />}
                        iconStyle={child.backgroundColor ? { backgroundColor: child.backgroundColor } : undefined}
                        isSelected={selectedCategoryId === child.id}
                        label={child.name}
                        primitives={categoryPrimitives}
                      />
                    </View>
                  ))}
                </RecordCategoryGrid></View>
              )}
            </Fragment>
          )
        })}
      </RecordCategoryGrid></View>
      </ScrollView>
      <View className='create-form'>
        {!isNoteFocused && <View className='row create-form__pickers'>
          <Button className='record-editor-detail-chip' onClick={() => { handleAmountFocus(); setIsDatePickerOpen(true) }}><RecordDetailChipContent primitive={Text} icon={<DesignIcon name='editor-date' size={17} tone='category' />}>{selectedDate === dateKey(new Date()) ? '今天' : selectedDate}</RecordDetailChipContent></Button>
        </View>}
        <RecordEntryRow
          caption={selectedCategory ? `${selectedCategory.path ?? selectedCategory.name} · ${recordType === 'sub' ? '支出' : '收入'}` : '选择分类'}
          primitives={{ Box: View, Note: View, Text }}
          noteInput={<Input className='bill-record-entry__note-input' focus={isNoteFocused} value={remark} placeholder='写个备注吧...' onFocus={() => setIsNoteFocused(true)} onBlur={() => setIsNoteFocused(false)} onInput={event => setRemark(event.detail.value)} />}
          amountControl={(
            <Button className='bill-record-entry__amount-control' aria-label={`金额：${amount || '0.00'}`} onClick={handleAmountFocus}>
              <RecordAmountVisual
                value={amount || '0.00'}
                primitives={{ Box: View, Text }}

              />
            </Button>
          )}
        />
        {formError && <Text className='error-text'>{formError}</Text>}
        {!isNoteFocused && <RecordKeypad
          canCalculate={calculator.canCalculate}
          canSubmit={calculator.canSubmit && Boolean(selectedCategory)}
          operatorsEnabled={Number.parseFloat(calculator.totals) > 0}
          isCalculationPending={calculator.completeText === '='}
          isSubmitting={createMutation.isLoading}
          onAction={calculator.handleAction}
          onComplete={() => {
            if (calculator.completeText === '=')
              calculator.resolveAmount()
            else
              void handleSubmit()
          }}
        />}
      </View>
      {isDatePickerOpen && <DateTimePicker date={selectedDate} time={selectedTime} onClose={() => setIsDatePickerOpen(false)} onConfirm={(date, time) => { setSelectedDate(date); setSelectedTime(time) }} />}
    </Page>
  )
}
