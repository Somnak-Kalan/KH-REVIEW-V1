import styled from 'styled-components'
import { Select } from 'antd'

const CustomSelect = styled(Select)`
  .ant-select-selector {
    border-radius: 5px !important;
    // border: none !important;
    outline: none !important;
    background-color: none !important;
    box-shadow: none !important; /* Removes the box-shadow */
  }

  .ant-select-selector .ant-select-selection-item {
    border-radius: 5 !important;
    background-color: none !important;
  }

  .ant-select-selector .ant-select-selection-search {
    border-radius: 0 !important;
    background-color: none !important;
  }

  .ant-select-dropdown {
    border-radius: 0 !important;
    background-color: none !important;
  }
  /* Set input to uppercase */
  .ant-select-selection-search-input {
    text-transform: uppercase;
  }
`

export default CustomSelect
