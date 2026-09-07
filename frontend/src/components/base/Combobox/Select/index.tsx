import { useCallback, useEffect, useMemo, useState } from 'react';
import { Combobox } from '@/components/base';

import { type ComboboxSelectProps, CreateValue, type FinalValue } from './types'
import { MultipleInputGroup } from './MultipleInputGroup'
import { SingleInputGroup } from './SingleInputGroup'
import { Portal } from './Portal'

export * from './types'

export function ComboboxSelect<Value, Multiple extends boolean = false>({
                                                                            id,
                                                                            items,
                                                                            itemName,
                                                                            itemToStringLabel,
                                                                            itemToStringValue,
                                                                            itemToElementLabel,
                                                                            multiple,
                                                                            loading,
                                                                            disabled,
                                                                            readOnly,
                                                                            placeholder,
                                                                            onValueChange,
                                                                            value,
                                                                            create,
                                                                            creatable,
                                                                            className,
                                                                            valuePopover,
                                                                            defaultValue,
                                                                            defaultStringLabel,
                                                                            defaultValueString,
                                                                            fixedValue,
                                                                            fixedValueString,
                                                                            name,
                                                                            ...props
                                                                        }: ComboboxSelectProps<Value, Multiple>) {
    const [ query, setQuery ] = useState<string>('');
    const [ isCreating, setIsCreating ] = useState<boolean>(false);
    const [ selected, _setSelected ] = useState<FinalValue<Value, Multiple> | undefined>(value ?? undefined);
    const setSelected = useCallback((data: FinalValue<Value, Multiple>) => {
        onValueChange?.(data)
        _setSelected(data)
    }, [ onValueChange ]);
    useEffect(() => {
        if (value !== selected)
            // eslint-disable-next-line react-hooks/set-state-in-effect
            _setSelected(value ?? undefined)
    }, [ value ]);


    const _itemToStringValue = useCallback((data: Value | CreateValue) => {
        if ((data as CreateValue).__create) return (data as CreateValue).id;
        return itemToStringValue?.(data as Value) ?? JSON.stringify(data)
    }, [ itemToStringValue ])

    const _itemToStringLabel = useCallback((data: Value | CreateValue | null) => {
        if (!data) return '-';
        if ((data as CreateValue).__create) return (data as CreateValue).label;
        return itemToStringLabel?.(data as Value) ?? JSON.stringify(data)
    }, [ itemToStringLabel ])

    const _itemToElementLabel = useCallback((data: Value | CreateValue | null) => {
        if (!data) return undefined;
        if ((data as CreateValue).__create) return (data as CreateValue).label;
        return itemToElementLabel?.(data as Value) ?? _itemToStringLabel(data)
    }, [ itemToElementLabel, _itemToStringLabel ])

    const itemsForView: readonly (Value | CreateValue)[] = useMemo(() => {
        if (!items) return []
        if (!creatable || !create) return items
        const trimmed = query.trim();
        if (trimmed === '') return items
        const lowered = trimmed.toLocaleLowerCase();
        const exactExists = items.some((l: Value) => (itemToStringLabel?.(l) ?? JSON.stringify(l)).trim().toLocaleLowerCase() === lowered);
        if (exactExists) return items
        return [ ...items, {
            __create: trimmed,
            id: `create:${ lowered }`,
            label: `Create "${ trimmed }"`,
        } as CreateValue ];
    }, [ items, itemToStringLabel, create, query, creatable ]);

    const _onValueChange = useCallback((data: FinalValue<Value | CreateValue, Multiple>) => {
        if (!data || create === undefined) return setSelected(data as FinalValue<Value, Multiple>)
        if (multiple) {
            const initialData = data as Value[]
            const createData = initialData.find(d => (d as CreateValue).__create)
            if ((createData as CreateValue)?.__create) {
                setIsCreating(true)
                create((createData as CreateValue).__create).then(newData => {
                    if (!newData) return;
                    setSelected([ ...(selected ?? []) as Value[], newData ] as FinalValue<Value, Multiple>)
                }).finally(() => {
                    setIsCreating(false)
                })
                setQuery('');
                return
            }
        }

        if (!multiple && (data as Value | CreateValue as CreateValue)?.__create) {
            setIsCreating(true)
            create((data as Value | CreateValue as CreateValue).__create).then(newData => {
                if (!newData) return;
                setSelected(newData as FinalValue<Value, Multiple>)
            }).finally(() => {
                setIsCreating(false)
            })
            setQuery('');
            return
        }

        setSelected(data as FinalValue<Value, Multiple>)
    }, [ create, query, setSelected, itemName, multiple, selected ])

    const _defaultValue = useMemo(() => {
        if (defaultValue) return defaultValue
        if (defaultValueString) {
            if (multiple) return items?.filter(i => defaultValueString.includes(itemToStringValue?.(i) || i))
            return items?.find(i => (itemToStringValue?.(i) || i) === defaultValueString) ?? null
        }
        if (defaultStringLabel) {
            if (multiple) return items?.filter(i => defaultStringLabel.includes(itemToStringLabel?.(i) || i))
            return items?.find(i => (itemToStringLabel?.(i) || i) === defaultStringLabel) ?? null
        }
    }, [ items, defaultStringLabel, defaultValue, itemToStringLabel, multiple, defaultValueString, itemToStringValue ])

    const _fixedValue = useMemo(() => {
        if (fixedValue) return fixedValue
        if (fixedValueString) {
            if (multiple) {
                const data = items?.filter(i => fixedValueString.includes(itemToStringValue?.(i) || i))
                if (data && data.length > 0) return data
                return undefined
            }
            return items?.find(i => (itemToStringValue?.(i) || i) === fixedValueString)
        }
    }, [ items, fixedValueString, fixedValue, itemToStringValue ])

    const finalValue = useMemo(() => {
        if (_fixedValue !== undefined) return _fixedValue
        if (selected !== undefined) return selected
        if (_defaultValue !== undefined) return _defaultValue

        // Default value is never undefined:
        // It is always controlled, at least by this component
        return (multiple ? [] : null)
    }, [ multiple, _fixedValue, selected, _defaultValue, multiple ])

    return <Combobox.Root multiple={ multiple }
                          itemToStringLabel={ _itemToStringLabel }
                          readOnly={ !!_fixedValue || readOnly }
                          disabled={ disabled || loading }
                          items={ itemsForView }
                          inputValue={ query }
                          value={ finalValue }
                          onInputValueChange={ setQuery }
                          onValueChange={ _onValueChange }
                          itemToStringValue={ itemToStringValue ? _itemToStringValue : undefined }
                          { ...props as Partial<ComboboxSelectProps<Value | CreateValue, Multiple>> }>

        { multiple ? <MultipleInputGroup id={ id }
                                         name={ name }
                                         loading={ loading || isCreating }
                                         className={ className }
                                         itemName={ itemName }
                                         placeholder={ placeholder }
                                         disabled={ disabled }
                                         readOnly={ readOnly }
                                         itemToElementLabel={ _itemToElementLabel }/> :
            <SingleInputGroup id={ id }
                              name={ name }
                              className={ className }
                              loading={ loading || isCreating }
                              itemToElementLabel={ _itemToElementLabel }
                              disabled={ disabled }
                              readOnly={ readOnly }
                              itemName={ itemName }
                              valuePopover={ valuePopover }
                              placeholder={ placeholder }/> }

        <Portal itemName={ itemName }
                itemToElementLabel={ _itemToElementLabel }/>
    </Combobox.Root>
}