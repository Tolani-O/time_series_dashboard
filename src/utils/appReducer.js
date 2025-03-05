// Create reducer function to handle all state updates
export function appReducer(state, action) {
    switch (action.type) {
        case 'SET_FILES':
            return {...state, files: action.payload};

        case 'SET_SELECTED_FILES':
            return {...state, selectedFiles: action.payload};

        case 'SET_APP_DATA':
            return {...state, appData: {...state.appData, ...action.payload}};

        case 'UPDATE_TIME_SERIES_DATA':
            return {
                ...state,
                appData: {
                    ...state.appData,
                    timeSeriesData: {...state.appData.timeSeriesData, [action.fileId]: action.data}
                }
            };

        case 'UPDATE_TIME_INDICES':
            return {
                ...state,
                appData: {
                    ...state.appData,
                    timeIndices: {...state.appData.timeIndices, [action.fileId]: action.data}
                }
            };

        case 'UPDATE_PRICE_DIST_DATA':
            return {
                ...state,
                appData: {
                    ...state.appData,
                    priceDistData: {...state.appData.priceDistData, [action.fileId]: action.data}
                }
            };

        case 'UPDATE_VOLUME_DIST_DATA':
            return {
                ...state,
                appData: {
                    ...state.appData,
                    volumeDistData: {...state.appData.volumeDistData, [action.fileId]: action.data}
                }
            };

        case 'UPDATE_SUMMARY_DATA':
            return {
                ...state,
                appData: {
                    ...state.appData,
                    summaryData: {...state.appData.summaryData, [action.fileId]: action.data}
                }
            };

        case 'SET_TIME_RANGE':
            return {...state, timeRange: action.payload};

        case 'SET_MAX_TIME_VALUE':
            return {...state, maxTimeValue: action.payload};

        case 'SET_LOADING':
            return {
                ...state,
                loading: {...state.loading, ...action.payload}
            };

        case 'SET_ERROR':
            return {...state, error: action.payload};

        case 'SET_CACHE_CLEARED':
            return {...state, isCacheCleared: action.payload};

        case 'CLEAR_CACHE':
            return {
                ...state,
                selectedFiles: [],
                appData: {
                    timeSeriesData: {},
                    timeIndices: {},
                    priceDistData: {},
                    volumeDistData: {},
                    summaryData: {}
                },
                timeRange: [0, 100],
                maxTimeValue: 1000,
                isCacheCleared: true
            };

        default:
            return state;
    }
}