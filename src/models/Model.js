'use strict';

import Serializable from '../support/traits/Serializable';
import Database from '../facades/Database';

class Model {
    static _applySelectionOptions(selectionParams, options){
        if ( options !== null && typeof options === 'object' ){
            if ( !isNaN(options?.limit) && options?.limit > 0 ){
                selectionParams.limit = options?.limit;
            }
            if ( options.order !== null && typeof options.order === 'object' ){
                const mapping = new this().getMapping();
                selectionParams.order = [];
                for ( const name in options.order ){
                    const type = options.order[name] === 'desc' ? 'desc' : 'asc';
                    const fieldName = mapping.fields[name]?.name ?? name;
                    selectionParams.order.push({
                        by: fieldName,
                        type: type
                    });
                }
            }
        }
    }

    static _processFieldValue(value, definition){
        if ( value instanceof Model ){
            const relationFields = {}, mapping = definition.relation.mapping;
            for ( const fieldName in mapping ){
                const method = definition.mapping[fieldName].method;
                relationFields[fieldName] = value[method]();
            }
            value = relationFields;
        }
        return value;
    }

    static _buildSelectionParams(filters, options){
        let mapping = new this().getMapping(), where = {}, hasFilters = false;
        const selectionParams = { from: mapping.tableName };
        for ( const name in filters ){
            if ( mapping.fields[name] !== null && typeof mapping.fields[name] === 'object' ){
                let fieldName = ( mapping.fields[name]?.name ?? name ), processedValue = filters[name];
                let preventAssignment = false;
                if ( Array.isArray(filters[name]) ){
                    preventAssignment = true;
                    processedValue = {
                        in: filters[name].map((entry) => {
                            return this._processFieldValue(entry, mapping.fields[name]);
                        })
                    };
                }else if ( filters[name] !== null && typeof filters[name] === 'object' ){
                    for ( const operator in filters[name] ){
                        if ( Array.isArray(filters[name][operator]) ){
                            processedValue = filters[name][operator].map((fieldValue) => {
                                return this._processFieldValue(fieldValue, mapping.fields[name]);
                            });
                        }else{
                            processedValue = this._processFieldValue(filters[name][operator], mapping.fields[name]);
                        }
                    }
                }else{
                    processedValue = this._processFieldValue(filters[name], mapping.fields[name]);
                }
                if ( processedValue !== null && typeof processedValue === 'object' && !preventAssignment ){
                    Object.assign(where, processedValue);
                    hasFilters = true;
                    continue;
                }
                where[fieldName] = processedValue;
                hasFilters = true;
            }
        }
        if ( hasFilters === true ){
            selectionParams.where = where;
        }
        this._applySelectionOptions(selectionParams, options);
        return selectionParams;
    }

    static async find(filters, options = {}){
        const selectionParams = this._buildSelectionParams(filters, Object.assign(options, {
            limit: 1
        }));
        let resultSet = await Database.getConnection().select(selectionParams), entity = null;
        if ( resultSet.length > 0 ){
            entity = new this();
            await entity.bindAttributes(resultSet[0]);
        }
        return entity;
    }

    static async findAll(filters, options = {}){
        const selectionParams = this._buildSelectionParams(filters, options);
        const resultSet = await Database.getConnection().select(selectionParams), entityList = [];
        await Promise.all(resultSet.map((result) => {
            const entity = new this();
            entityList.push(entity);
            return entity.bindAttributes(result);
        }));
        return entityList;
    }

    static async findAndDelete(filters){
        await Database.getConnection().remove(this._buildSelectionParams(filters));
    }

    #prepareFieldsForStoring(){
        const fields = Object.assign({}, this._attributes);
        for ( const fieldName in this._mapping.fields ){
            const relation = this._mapping.fields[fieldName].relation ?? null;
            if ( relation !== null ){
                if ( fields[fieldName] === null ){
                    for ( const foreignField in relation.mapping ){
                        fields[foreignField] = null;
                    }
                }else{
                    for ( const foreignField in relation.mapping ){
                        const method = relation.mapping[foreignField].method;
                        fields[foreignField] = null;
                        if ( fields[fieldName] instanceof Model ){
                            fields[foreignField] = fields[fieldName][method]();
                        }
                    }
                }
                delete fields[fieldName];
            }else if ( fields[fieldName] instanceof Serializable ){
                fields[fieldName] = fields[fieldName].serialize();
            }
        }
        return fields;
    }

    _attributes = {};
    _bound = false;
    _mapping = {};

    getMapping(){
        return this._mapping;
    }

    async bindAttributes(attributes){
        this._attributes = { _originalsReceived: attributes };
        for ( const fieldName in this._mapping.fields ){
            const relation = this._mapping.fields[fieldName].relation ?? null;
            this._attributes[fieldName] = attributes[fieldName] ?? null;
            const DTO = this._mapping.fields[fieldName].DTO ?? null;
            if ( relation !== null ){
                let lookupParams = {}, lookup = true;
                this._attributes[fieldName] = null;
                for ( const foreignField in relation.mapping ){
                    const foreignValue = attributes[foreignField] ?? null;
                    if ( foreignValue === null ){
                        lookup = false;
                        break;
                    }
                    lookupParams[relation.mapping[foreignField].foreign] = foreignValue;
                }
                if ( lookup ){
                    this._attributes[fieldName] = await relation.model.find(lookupParams);
                }
            }else if ( DTO !== null ){
                this._attributes[fieldName] = DTO.unserialize(this._attributes[fieldName]);
            }
        }
        this._bound = true;
    }

    async save(){
        const fields = this.#prepareFieldsForStoring();
        await Database.getConnection().insert({
            into: this._mapping.tableName,
            values: [fields],
            upsert: true
        });
        this._bound = true;
    }

    async delete(){
        const fields = this.#prepareFieldsForStoring(), selectionProperties = {};
        this._mapping.keys.forEach((key) => selectionProperties[key] = fields[key]);
        await Database.getConnection().remove({
            from: this._mapping.tableName,
            where: selectionProperties
        });
        this._bound = false;
    }
}

export default Model;
