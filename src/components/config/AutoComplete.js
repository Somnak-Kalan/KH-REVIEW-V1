import styled from 'styled-components'
import { AutoComplete } from 'antd'

const CustomAutoComplete = styled(AutoComplete)`
  .ant-select-selection-search-input {
    text-transform: uppercase !important;
  }
`
export default CustomAutoComplete
