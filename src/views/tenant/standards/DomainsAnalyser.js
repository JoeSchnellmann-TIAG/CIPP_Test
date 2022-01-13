import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { CButton, CSpinner } from '@coreui/react'
import { CellBadge, cellProgressBarFormatter, CippOffcanvas } from '../../../components/cipp'
import cellGetProperty from '../../../components/cipp/cellGetProperty'
import IndividualDomainCheck from './IndividualDomain'
import { CippPageList, ModalService } from '../../../components'
import { useExecDomainsAnalyserMutation } from '../../../store/api/reports'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheck, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons'

const RefreshAction = () => {
  const [execDomainsAnalyser, { isLoading, isSuccess, error }] = useExecDomainsAnalyserMutation()

  const showModal = () =>
    ModalService.confirm({
      body: (
        <div>
          Are you sure you want to force the Domain Analysis to run? This will slow down normal
          usage considerably. <br />
          <i>Please note: this runs at midnight automatically every day.</i>
        </div>
      ),
      onConfirm: () => execDomainsAnalyser(),
    })

  return (
    <CButton onClick={showModal} size="sm" className="m-1">
      {isLoading && <CSpinner size="sm" />}
      {error && <FontAwesomeIcon icon={faExclamationTriangle} className="pe-1" />}
      {isSuccess && <FontAwesomeIcon icon={faCheck} className="pe-1" />}
      Force Refresh All Data
    </CButton>
  )
}

const MoreInfoContent = ({ row }) => {
  return (
    <>
      <strong>Score Explanation: </strong>
      {row.ScoreExplanation}
      <br />
      <br />
      <strong>Expected SPF Record: </strong>
      {row.ExpectedSPFRecord}
      <br />
      <strong>Actual SPF Record: </strong>
      {row.ActualSPFRecord}
      <br />
      <br />
      <strong>DMARC Full Policy: </strong>
      {row.DMARCFullPolicy}
      <br />
      <br />
      <strong>Expected MX Record: </strong>
      {row.ExpectedMXRecord}
      <br />
      <br />
      <strong>Actual MX Record: </strong>
      {row.ActualMXRecord}
      <br />
      <br />
      <strong>Supported Services: </strong>
      {row.SupportedServices}
      <br />
      <br />
      <strong>Is Default Domain: </strong>
      {row.IsDefault}
      <br />
      <br />
      <strong>Data Last Refreshed:</strong>
      {row.LastRefresh}
    </>
  )
}
MoreInfoContent.propTypes = {
  row: PropTypes.object.isRequired,
}

function checkDomain(tenantDomain) {
  return (
    <div key={tenantDomain}>
      <IndividualDomainCheck initialDomain={tenantDomain} readOnly={true} isOffcanvas={true} />
    </div>
  )
}
checkDomain.propTypes = {
  tenantDomain: PropTypes.string,
}

const DomainsAnalyser = () => {
  const [individualDomainResults, setIndividualDomainResults] = useState()
  const [domainCheckVisible, setDomainCheckVisible] = useState(false)

  const handleMoreInfo = ({ row }) => {
    /*ModalService.open({
      body: <MoreInfoCard row={row} />,
      title: `${row.Tenant} More Information`,
    })*/
    setIndividualDomainResults(checkDomain(row.Domain))
    setDomainCheckVisible(true)
  }

  const columns = [
    {
      name: 'Domain',
      selector: (row) => row['Domain'],
      sort: true,
      exportSelector: 'Domain',
    },
    {
      name: 'Security Score',
      selector: (row) => {
        if (!row['Score']) {
          return ''
        } else {
          return row['ScorePercentage']
        }
      },
      sort: true,
      exportSelector: 'ScorePercentage',
      cell: cellProgressBarFormatter(),
    },
    {
      name: 'Mail Provider',
      selector: (row) => row['MailProvider'],
      exportSelector: 'MailProvider',
      sort: true,
      cell: (row, index, column) => {
        const cell = cellGetProperty(row, index, column)
        return <CellBadge label={cell} color={cell === 'Unknown' ? 'warning' : 'info'} />
      },
    },
    {
      name: 'SPF Pass Test',
      selector: (row) => row['SPFPassTest'],
      exportSelector: 'SPFPassTest',
      sort: true,
      cell: (row, index, column) => {
        const cell = cellGetProperty(row, index, column)
        if (cell === true) {
          if (row.SPFPassAll === true) {
            return <CellBadge color="success" label="SPF Pass" />
          } else {
            return <CellBadge color="danger" label="SPF Soft Fail" />
          }
        } else if (cell === false) {
          return <CellBadge color="danger" label="SPF Fail" />
        }
        return <CellBadge color="info" label="No Data" />
      },
    },
    {
      name: 'MX Pass Test',
      selector: (row) => row['MXPassTest'],
      exportSelector: 'MXPassTest',
      sort: true,
      cell: (row, index, column) => {
        const cell = cellGetProperty(row, index, column)
        if (cell === true) {
          return <CellBadge color="success" label="MX Pass" />
        } else if (cell === false) {
          return <CellBadge color="danger" label="MX Fail" />
        }
        return <CellBadge color="info" label="No Data" />
      },
    },
    {
      name: 'DMARC Present',
      selector: (row) => row['DMARCPresent'],
      exportSelector: 'DMARCPresent',
      sort: true,
      cell: (row, index, column) => {
        const cell = cellGetProperty(row, index, column)

        if (cell === true) {
          if (row.DMARCReportingActive === true) {
            return <CellBadge color="success">DMARC Present</CellBadge>
          }
          return <CellBadge color="warning">DMARC Present No Reporting Data</CellBadge>
        } else if (cell === false) {
          return <CellBadge color="danger">DMARC Missing</CellBadge>
        }
        return <CellBadge color="info" label="No Data" />
      },
    },
    {
      name: 'DMARC Action Policy',
      selector: (row) => row['DMARCActionPolicy'],
      exportSelector: 'DMARCActionPolicy',
      sort: true,
      cell: (row, index, column) => {
        const cell = cellGetProperty(row, index, column)

        if (cell === 'Reject') {
          return <CellBadge color="success">Reject</CellBadge>
        } else if (cell === 'Quarantine') {
          return <CellBadge color="warning">Quarantine</CellBadge>
        } else if (cell === 'None') {
          return <CellBadge color="danger">Report Only</CellBadge>
        }
        return <CellBadge color="danger" label="No DMARC" />
      },
    },
    {
      name: 'DMARC % Pass',
      selector: (row) => row['DMARCPercentagePass'],
      exportSelector: 'DMARCPercentagePass',
      sort: true,
      cell: (row, index, column) => {
        const cell = cellGetProperty(row, index, column)

        if (cell === true) {
          return <CellBadge color="success">All Mail Analysed</CellBadge>
        }
        if (cell === false) {
          return <CellBadge color="danger">Partial or None Analysed</CellBadge>
        }
        return <CellBadge color="danger">No DMARC</CellBadge>
      },
    },
    {
      name: 'DNSSec Enabled',
      selector: (row) => row['DNSSECPresent'],
      exportSelector: 'DNSSECPresent',
      sort: true,
      cell: (row, index, column) => {
        const cell = cellGetProperty(row, index, column)

        if (cell === true) {
          return <CellBadge color="success">DNSSEC Enabled</CellBadge>
        }
        if (cell === false) {
          return <CellBadge color="danger">DNSSEC Disabled</CellBadge>
        }
        return <CellBadge color="info">No Data</CellBadge>
      },
    },
    {
      name: 'DKIM Enabled',
      selector: (row) => row['DKIMEnabled'],
      exportSelector: 'DKIMEnabled',
      sort: true,
      cell: (row, index, column) => {
        const cell = column.selector(row)
        if (cell === true) {
          return <CellBadge color="success">DKIM Enabled</CellBadge>
        }
        if (cell === false) {
          return <CellBadge color="danger">DKIM Disabled</CellBadge>
        }
        return <CellBadge color="warning">No Data</CellBadge>
      },
    },
    {
      name: 'More Info',
      dataField: 'moreInfo',
      isDummyField: true,
      sort: true,
      cell: (row) => {
        return (
          <CButton size="sm" onClick={() => handleMoreInfo({ row })}>
            More Info
          </CButton>
        )
      },
    },
  ]

  return (
    <CippPageList
      title="Domain Analyser"
      tenantSelector={false}
      datatable={{
        path: '/api/DomainAnalyser_List',
        columns,
        reportName: 'Domains-Analyzer',
        tableProps: {
          actions: [<RefreshAction key="refresh-action-button" />],
        },
      }}
    >
      <CippOffcanvas
        id="individual-domain"
        visible={domainCheckVisible}
        hideFunction={() => setDomainCheckVisible(false)}
        title="More Info"
        placement="end"
      >
        {individualDomainResults}
      </CippOffcanvas>
    </CippPageList>
  )
}

export default DomainsAnalyser
