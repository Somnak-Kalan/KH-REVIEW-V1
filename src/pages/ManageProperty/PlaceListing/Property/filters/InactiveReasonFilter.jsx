import React, {
    useMemo,
} from 'react'

import {
    Select,
} from 'antd'


/* =========================================================
   INACTIVE REASONS

   label = UI display
   value = backend value
========================================================= */

const REASONS = [
    {
        label:
            'Permanently Closed',

        value:
            'permanently_closed',
    },

    {
        label:
            'Data Maintenance',

        value:
            'data_maintenance',
    },

    {
        label:
            'Does Not Meet Listing Criteria',

        value:
            'does_not_meet_listing_criteria',
    },

    {
        label:
            'Policy Violation / Reported',

        value:
            'policy_violation_reported',
    },
]


/* =========================================================
   SAFE NUMBER
========================================================= */

const toNumber = (
    value
) => {
    const number =
        Number(
            value
        )

    return Number.isFinite(
        number
    )
        ? number
        : 0
}


/* =========================================================
   GET REASON COUNT

   Supports both:

   {
       permanently_closed: 10
   }

   and old format:

   {
       "Permanently Closed": 10
   }
========================================================= */

const getReasonCount = (
    reasonSummary,
    reason
) => {
    if (
        !reasonSummary ||
        typeof reasonSummary !==
        'object'
    ) {
        return 0
    }


    return toNumber(
        reasonSummary?.[
        reason.value
        ] ??
        reasonSummary?.[
        reason.label
        ] ??
        0
    )
}


/* =========================================================
   COMPONENT
========================================================= */

export default function InactiveReasonFilter({
    value = 'All',
    onChange,
    reasonSummary = {},
    totalInactive = 0,
}) {

    /* =====================================================
       OPTIONS
    ===================================================== */

    const options =
        useMemo(
            () => {

                const allCount =
                    toNumber(
                        reasonSummary?.All ??
                        reasonSummary?.all ??
                        reasonSummary?.total ??
                        totalInactive
                    )


                return [
                    {
                        value:
                            'All',

                        label:
                            `All Reason `,
                    },


                    ...REASONS.map(
                        (
                            reason
                        ) => ({

                            value:
                                reason.value,

                            label:
                                `${reason.label}`,
                        })
                    ),
                ]
            },
            [
                reasonSummary,
                totalInactive,
            ]
        )


    /* =====================================================
       CHANGE
    ===================================================== */

    const handleChange = (
        selectedValue
    ) => {
        if (
            typeof onChange ===
            'function'
        ) {
            onChange(
                selectedValue
            )
        }
    }


    /* =====================================================
       RENDER
    ===================================================== */

    return (
        <Select
            value={
                value
            }

            onChange={
                handleChange
            }

            options={
                options
            }

            showSearch={
                false
            }

            popupMatchSelectWidth={
                305
            }

            style={{
                width:
                    305,
            }}
        />
    )
}