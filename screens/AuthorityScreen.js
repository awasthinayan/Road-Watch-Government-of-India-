import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  StatusBar,
  Image,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { RefreshControl } from "react-native";

export default function AuthorityScreen({ navigation, userData, onLogout }) {
  const [pendingReports, setPendingReports] = useState([]);
  const [approvedReports, setApprovedReports] = useState([]);
  const [rejectedReports, setRejectedReports] = useState([]);
  const [activeTab, setActiveTab] = useState("pending");
  const [refreshing, setRefreshing] = useState(false);

  // Fetch reports for approval
  const fetchReports = async () => {
    try {
      setRefreshing(true);
      const token = await AsyncStorage.getItem("token");
      if (!token) return;

      const response = await fetch(
        "https://noor-samsung.onrender.com/api/complaints",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok && data.data && data.data.complaints) {
        const reports = data.data.complaints;

        const pending = reports.filter(
          (report) => report.isLegitimate === null
        );
        const approved = reports.filter(
          (report) => report.isLegitimate === true
        );
        const rejected = reports.filter(
          (report) => report.isLegitimate === false
        );

        setPendingReports(pending);
        setApprovedReports(approved);
        setRejectedReports(rejected);
      }
    } catch (error) {
      console.error("Error fetching reports:", error);
      Alert.alert("Error", "Failed to fetch reports");
    } finally {
      setRefreshing(false);
    }
  };

  // Approve a report
  const approveReport = async (reportId) => {
    try {
      const token = await AsyncStorage.getItem("token");
      const response = await fetch(
        `https://noor-samsung.onrender.com/api/complaints/${reportId}/status`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            isLegitimate: true,
          }),
        }
      );

      if (response.ok) {
        Alert.alert("Success", "Report approved successfully");
        fetchReports();
      } else {
        Alert.alert("Error", "Failed to approve report");
      }
    } catch (error) {
      console.error("Error approving report:", error);
      Alert.alert("Error", "Failed to approve report");
    }
  };

  // Reject a report
  const rejectReport = async (reportId) => {
    try {
      const token = await AsyncStorage.getItem("token");
      const response = await fetch(
        `https://noor-samsung.onrender.com/api/complaints/${reportId}/status`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            isLegitimate: false,
          }),
        }
      );

      if (response.ok) {
        Alert.alert("Success", "Report rejected successfully");
        fetchReports();
      } else {
        Alert.alert("Error", "Failed to reject report");
      }
    } catch (error) {
      console.error("Error rejecting report:", error);
      Alert.alert("Error", "Failed to reject report");
    }
  };

  const getStatusText = (isLegitimate) => {
    switch (isLegitimate) {
      case true:
        return "Approved";
      case false:
        return "Rejected";
      default:
        return "Pending Review";
    }
  };

  const getStatusColor = (isLegitimate) => {
    switch (isLegitimate) {
      case true:
        return "#10B981";
      case false:
        return "#EF4444";
      default:
        return "#F59E0B";
    }
  };

  const getStatusIcon = (isLegitimate) => {
    switch (isLegitimate) {
      case true:
        return "checkmark-circle";
      case false:
        return "close-circle";
      default:
        return "time";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Unknown date";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Logout",
        onPress: () => {
          onLogout();
        },
      },
    ]);
  };

  const renderReportCard = (report, showActions = false) => (
    <View key={report._id} style={styles.reportCard}>
      <View style={styles.reportHeader}>
        <View style={styles.reportTitleContainer}>
          <Ionicons name="document-text" size={16} color="#6B7280" />
          <Text style={styles.reportTitle}>
            Report #{report._id.substring(0, 8)}
          </Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(report.isLegitimate) },
          ]}
        >
          <Ionicons
            name={getStatusIcon(report.isLegitimate)}
            size={12}
            color="#FFFFFF"
          />
          <Text style={styles.statusText}>
            {getStatusText(report.isLegitimate)}
          </Text>
        </View>
      </View>

      {/* Image Display */}
      {report.imageUrl ? (
        <Image
          source={{ uri: report.imageUrl }}
          style={styles.reportImage}
          resizeMode="cover"
        />
      ) : null}

      <Text style={styles.reportDescription}>
        {report.caption || "No description provided"}
      </Text>

      {/* Location Info */}
      <View style={styles.detailRow}>
        <Ionicons name="location" size={14} color="#6B7280" />
        <Text style={styles.detailLabel}>Road:</Text>
        <Text style={styles.detailValue}>
          {report.location?.roadName || "N/A"}
        </Text>
      </View>
      <View style={styles.detailRow}>
        <Ionicons name="navigate" size={14} color="#6B7280" />
        <Text style={styles.detailLabel}>Landmark:</Text>
        <Text style={styles.detailValue}>
          {report.location?.landmark || "N/A"}
        </Text>
      </View>
      <View style={styles.detailRow}>
        <Ionicons name="flag" size={14} color="#6B7280" />
        <Text style={styles.detailLabel}>Zip Code:</Text>
        <Text style={styles.detailValue}>
          {report.location?.zipCode || "N/A"}
        </Text>
      </View>

      {/* User Info */}
      <View style={styles.detailRow}>
        <Ionicons name="person" size={14} color="#6B7280" />
        <Text style={styles.detailLabel}>Reporter:</Text>
        <Text style={styles.detailValue}>{report.userId?.name || "N/A"}</Text>
      </View>
      <View style={styles.detailRow}>
        <Ionicons name="mail" size={14} color="#6B7280" />
        <Text style={styles.detailLabel}>Email:</Text>
        <Text style={styles.detailValue}>{report.userId?.email || "N/A"}</Text>
      </View>

      <View style={styles.detailsContainer}>
        <View style={styles.detailRow}>
          <Ionicons name="calendar" size={12} color="#6B7280" />
          <Text style={styles.detailLabel}>Submitted:</Text>
          <Text style={styles.detailValue}>{formatDate(report.createdAt)}</Text>
        </View>
      </View>

      {showActions && (
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.approveButton]}
            onPress={() => approveReport(report._id)}
          >
            <Ionicons name="checkmark" size={16} color="#FFFFFF" />
            <Text style={styles.approveButtonText}>Approve</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.rejectButton]}
            onPress={() => rejectReport(report._id)}
          >
            <Ionicons name="close" size={16} color="#FFFFFF" />
            <Text style={styles.rejectButtonText}>Reject</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  const getCurrentReports = () => {
    switch (activeTab) {
      case "pending":
        return pendingReports;
      case "approved":
        return approvedReports;
      case "rejected":
        return rejectedReports;
      default:
        return [];
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#2563EB" barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerTitle}>RoadWatch</Text>
            <Text style={styles.headerSubtitle}>Authority Dashboard</Text>
          </View>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color="#FFFFFF" />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.userInfo}>
          <Ionicons name="person-circle" size={24} color="#FFFFFF" />
          <View style={styles.userDetails}>
            <Text style={styles.userName}>{userData?.username}</Text>
            <Text style={styles.userRole}>{userData?.loginType}</Text>
          </View>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{pendingReports.length}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{approvedReports.length}</Text>
            <Text style={styles.statLabel}>Approved</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{rejectedReports.length}</Text>
            <Text style={styles.statLabel}>Rejected</Text>
          </View>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "pending" && styles.activeTab]}
          onPress={() => setActiveTab("pending")}
        >
          <Ionicons
            name="time-outline"
            size={20}
            color={activeTab === "pending" ? "#2563EB" : "#6B7280"}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === "pending" && styles.activeTabText,
            ]}
          >
            Pending
          </Text>
          <View
            style={[
              styles.tabBadge,
              activeTab === "pending" && styles.activeTabBadge,
            ]}
          >
            <Text style={styles.tabBadgeText}>{pendingReports.length}</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === "approved" && styles.activeTab]}
          onPress={() => setActiveTab("approved")}
        >
          <Ionicons
            name="checkmark-circle-outline"
            size={20}
            color={activeTab === "approved" ? "#2563EB" : "#6B7280"}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === "approved" && styles.activeTabText,
            ]}
          >
            Approved
          </Text>
          <View
            style={[
              styles.tabBadge,
              activeTab === "approved" && styles.activeTabBadge,
            ]}
          >
            <Text style={styles.tabBadgeText}>{approvedReports.length}</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === "rejected" && styles.activeTab]}
          onPress={() => setActiveTab("rejected")}
        >
          <Ionicons
            name="close-circle-outline"
            size={20}
            color={activeTab === "rejected" ? "#2563EB" : "#6B7280"}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === "rejected" && styles.activeTabText,
            ]}
          >
            Rejected
          </Text>
          <View
            style={[
              styles.tabBadge,
              activeTab === "rejected" && styles.activeTabBadge,
            ]}
          >
            <Text style={styles.tabBadgeText}>{rejectedReports.length}</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Reports List */}
      <ScrollView
        style={styles.scrollContent}
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={fetchReports}
            colors={["#2563EB"]}
            tintColor={"#2563EB"}
          />
        }
      >
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {activeTab === "pending" && "Pending Reports for Review"}
              {activeTab === "approved" && "Approved Reports"}
              {activeTab === "rejected" && "Rejected Reports"}
            </Text>
            <TouchableOpacity
              onPress={fetchReports}
              style={styles.refreshButton}
            >
              <Ionicons name="refresh" size={20} color="#2563EB" />
            </TouchableOpacity>
          </View>

          {getCurrentReports().length > 0 ? (
            getCurrentReports().map((report) =>
              renderReportCard(report, activeTab === "pending")
            )
          ) : (
            <View style={styles.emptyState}>
              <Ionicons
                name="document-text-outline"
                size={64}
                color="#D1D5DB"
              />
              <Text style={styles.emptyStateText}>
                {activeTab === "pending" && "No pending reports to review"}
                {activeTab === "approved" && "No approved reports yet"}
                {activeTab === "rejected" && "No rejected reports yet"}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  reportImage: {
    width: "100%",
    height: 180,
    borderRadius: 12,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#374151",
    minWidth: 90,
  },
  detailValue: {
    fontSize: 12,
    color: "#6B7280",
    flexShrink: 1,
  },
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  header: {
    backgroundColor: "#2563EB",
    padding: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 15,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#E0F2FE",
    marginTop: 2,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  logoutText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  userDetails: {
    marginLeft: 10,
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  userRole: {
    fontSize: 14,
    color: "#E0F2FE",
    textTransform: "capitalize",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  statLabel: {
    fontSize: 12,
    color: "#E0F2FE",
    marginTop: 2,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
    gap: 8,
  },
  activeTab: {
    borderBottomWidth: 3,
    borderBottomColor: "#2563EB",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
  },
  activeTabText: {
    color: "#2563EB",
  },
  tabBadge: {
    backgroundColor: "#E5E7EB",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  activeTabBadge: {
    backgroundColor: "#2563EB",
  },
  tabBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#374151",
  },
  activeTabBadgeText: {
    color: "#FFFFFF",
  },
  scrollContent: {
    flex: 1,
  },
  section: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
  },
  refreshButton: {
    padding: 8,
  },
  reportCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  reportHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  reportTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 10,
    gap: 6,
  },
  reportTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "bold",
  },
  reportDescription: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 12,
    lineHeight: 20,
  },
  detailsContainer: {
    gap: 6,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: "500",
    color: "#374151",
    minWidth: 100,
  },
  detailValue: {
    fontSize: 12,
    color: "#6B7280",
    flex: 1,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 10,
    marginTop: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  approveButton: {
    backgroundColor: "#10B981",
  },
  rejectButton: {
    backgroundColor: "#EF4444",
  },
  approveButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 14,
  },
  rejectButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 14,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  emptyStateText: {
    textAlign: "center",
    color: "#9CA3AF",
    fontSize: 16,
    marginTop: 16,
    fontStyle: "italic",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    width: "100%",
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
  },
  modalSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 16,
    lineHeight: 20,
  },
  reasonInput: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    textAlignVertical: "top",
    minHeight: 100,
    marginBottom: 20,
    color: "#374151",
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
  },
  modalButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 8,
    gap: 6,
  },
  cancelButton: {
    backgroundColor: "#F3F4F6",
  },
  confirmRejectButton: {
    backgroundColor: "#EF4444",
  },
  disabledButton: {
    backgroundColor: "#9CA3AF",
  },
  cancelButtonText: {
    color: "#374151",
    fontWeight: "600",
    fontSize: 14,
  },
  confirmRejectButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 14,
  },
});
