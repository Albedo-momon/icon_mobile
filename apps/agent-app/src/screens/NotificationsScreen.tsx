import React, { useEffect, useState } from 'react'
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native'
import { StackNavigationProp } from '@react-navigation/stack'
import { AgentStackParamList, NotificationItem } from '@icon/config'
import { Screen, Text } from '@icon/ui'
import { useAgent } from '../providers/AgentProvider'
import BottomNavBar from '../components/BottomNavBar'
import { Ionicons } from '@expo/vector-icons'

export type NotificationsNav = StackNavigationProp<AgentStackParamList, 'Notifications'>

interface Props {
  navigation: NotificationsNav
}

const NotificationsScreen: React.FC<Props> = ({ navigation }) => {
  const { config } = useAgent()
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const { agentService } = await import('@icon/api')
        const resp = await agentService.getNotifications()
        const data = (resp as any)?.data || resp
        setNotifications(Array.isArray(data) ? data : [])
      } catch (e) {
        console.warn('[Notifications] Failed to load:', e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [config.mockMode])

  const iconFor = (n: NotificationItem) => {
    if (n.icon) return n.icon as any
    switch (n.type) {
      case 'warning': return 'alert-circle-outline'
      case 'payment': return 'card-outline'
      case 'comment': return 'chatbubble-outline'
      case 'request': return 'document-text-outline'
      case 'event': return 'calendar-outline'
      default: return 'notifications-outline'
    }
  }

  const timeSince = (iso?: string) => {
    if (!iso) return '—'
    const then = new Date(iso).getTime()
    const now = Date.now()
    const diff = Math.max(0, now - then)
    const mins = Math.floor(diff / 60000)
    if (mins < 60) return `${mins} min ago`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`
    const days = Math.floor(hours / 24)
    return `${days} day${days === 1 ? '' : 's'} ago`
  }

  const todayStr = new Date().toLocaleDateString('en-GB') // e.g., 19/03/2024
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000)
  const yesterdayStr = yesterday.toLocaleDateString('en-GB')

  return (
    <Screen style={styles.container}>
      <View style={styles.pageHeader}>
        <Text variant="h2" style={styles.title}>Notifications</Text>
        <View style={styles.dateRow}>
          <View style={[styles.dateChip, styles.dateChipActive]}>
            <Ionicons name="calendar-outline" size={14} color="#356AE6" />
            <Text variant="captionSm" style={styles.dateText}>{todayStr}</Text>
          </View>
          <View style={styles.dateChip}>
            <Ionicons name="calendar-outline" size={14} color="#7C8DA4" />
            <Text variant="captionSm" style={[styles.dateText, { color: '#7C8DA4' }]}>{yesterdayStr}</Text>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {loading ? (
          <Text>Loading notifications...</Text>
        ) : (
          notifications.map((n) => (
            <View key={n.id} style={[styles.item, n.type === 'warning' ? styles.itemWarning : null]}>
              <View style={[styles.iconWrap, n.type === 'warning' ? styles.iconWrapWarning : null]}>
                <Ionicons name={iconFor(n)} size={16} color={n.type === 'warning' ? '#E8A500' : '#3E86F5'} />
              </View>
              <View style={styles.itemContent}>
                <Text variant="caption" style={styles.itemTitle}>{n.title}</Text>
                <Text variant="caption" style={styles.itemTime}>{timeSince(n.createdAt)}</Text>
              </View>
              <TouchableOpacity accessibilityLabel="More options" style={styles.moreBtn}>
                <Ionicons name="ellipsis-vertical" size={16} color="#9AA6B2" />
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>

      <View style={styles.bottomNav}>
        <BottomNavBar onHome={() => navigation.navigate('Dashboard')} onSocial={() => navigation.navigate('Requests')} onNotifications={() => navigation.navigate('Notifications')}
          onProfile={() => navigation.navigate('Profile')}/>
      </View>
    </Screen>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  pageHeader: { paddingHorizontal: 16, paddingTop: 20, marginBottom: 10 },
  title: { color: '#333' },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  dateChip: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#F3F6FB', borderWidth: 1, borderColor: '#EDF2FA', borderRadius: 8, paddingVertical: 6, paddingHorizontal: 10 },
  dateChipActive: { backgroundColor: '#EAF2FF', borderColor: '#DCE7FF' },
  dateText: { color: '#356AE6' },
  content: { paddingHorizontal: 16, paddingBottom: 90 },
  item: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#EEF3FB', borderRadius: 12, padding: 12, marginBottom: 10 },
  itemWarning: { backgroundColor: '#FFF7E6', borderColor: '#FFECC7' },
  iconWrap: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#EAF2FF', alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  iconWrapWarning: { backgroundColor: '#FFF0CC' },
  itemContent: { flex: 1 },
  itemTitle: { color: '#2D3B4C' },
  itemTime: { color: '#7C8DA4', marginTop: 4 },
  moreBtn: { padding: 6 },
  bottomNav: { position: 'absolute', left: 0, right: 0, bottom: 0, borderTopWidth: 1, borderColor: '#eee', backgroundColor: '#fff' },
})

export default NotificationsScreen