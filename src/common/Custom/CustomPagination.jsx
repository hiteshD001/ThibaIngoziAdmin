import React, { useState } from "react";
import Prev from "../../assets/images/left.png";
import Next from "../../assets/images/right.png";
const CustomPagination = ({
    page,
    setPage,
    limit,
    setLimit,
    totalPages,
    totalItems,
}) => {
    const handleRowsChange = (e) => {
        setLimit(Number(e.target.value));
        setPage(1); // Reset to page 1 when limit changes
    };

    return (
        <div style={styles.container}>
            {/* Rows per page dropdown */}
            <div style={styles.left}>
                <span style={styles.label}>Rows per page:</span>
                <select value={limit} onChange={handleRowsChange} style={styles.select}>
                    {[5, 10, 20, 50].map((size) => (
                        <option key={size} value={size}>{size}</option>
                    ))}
                </select>
            </div>

            {/* Page navigation */}
            <div style={styles.right}>
                <button
                    style={styles.navBtn}
                    onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                    disabled={page === 1}
                >
                    <img src={Prev} style={styles.navIcon} />
                </button>
                <span style={styles.pageInfo}>
                    Page {page} / {totalPages}
                </span>
                <button
                    style={styles.navBtn}
                    onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={page === totalPages}
                >
                    <img src={Next} style={styles.navIcon} />
                </button>
            </div>
        </div>
    );
};

export default CustomPagination;
const styles = {
    container: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: "20px",
        padding: "10px 0",
        borderTop: "1px solid #ddd",
        flexWrap: "wrap",
    },
    left: {
        display: "flex",
        alignItems: "center",
        gap: "10px",
    },
    label: {
        fontWeight: 500,
    },
    select: {
        padding: "4px 8px",
        borderRadius: "4px",
        border: 'none'
    },
    total: {
        marginLeft: "10px",
        fontSize: "14px",
        color: "#666",
    },
    right: {
        display: "flex",
        alignItems: "center",
        gap: "10px",
    },
    navBtn: {
        padding: "4px 10px",
        // borderRadius: "4px",
        border: "none",
        backgroundColor: "white",
        cursor: "pointer",
    },
    navIcon: {
        width: "100%",
        maxWidth: "10px",
        height: "auto",
    },
    pageInfo: {
        fontSize: "14px",
        fontWeight: "500",
    },
};
