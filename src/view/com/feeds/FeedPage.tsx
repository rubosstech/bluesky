import React, { useState } from 'react'
import {StyleSheet, TouchableOpacity, View} from 'react-native'
import {AppBskyActorDefs} from '@atproto/api'
import {msg, Trans} from '@lingui/macro'
import {useLingui} from '@lingui/react'
import {NavigationProp, useNavigation} from '@react-navigation/native'
import {useQuery, useQueryClient} from '@tanstack/react-query'

import {EditBig_Stroke2_Corner0_Rounded as EditBig} from '#/components/icons/EditBig'
import {getRootNavigation, getTabState, TabState} from '#/lib/routes/helpers'
import {logEvent} from '#/lib/statsig/statsig'
import {isNative} from '#/platform/detection'
import {listenSoftReset} from '#/state/events'
import {FeedFeedbackProvider, useFeedFeedback} from '#/state/feed-feedback'
import {STALE} from '#/state/queries'
import {RQKEY as FEED_RQKEY} from '#/state/queries/post-feed'
import {FeedDescriptor, FeedParams} from '#/state/queries/post-feed'
import {truncateAndInvalidate} from '#/state/queries/util'
import {useSession} from '#/state/session'
import {useSetMinimalShellMode} from '#/state/shell'
import {useComposerControls} from '#/state/shell/composer'
import {useAgent} from '#/state/verus_session'
import {useAnalytics} from 'lib/analytics/analytics'
import {ComposeIcon2} from 'lib/icons'
import {AllNavigatorParams} from 'lib/routes/types'
import {colors, s} from 'lib/styles'
import {Text} from 'view/com/util/text/Text'
import {useHeaderOffset} from '#/components/hooks/useHeaderOffset'
import {Feed} from '../posts/Feed'
import {FAB} from '../util/fab/FAB'
import {ListMethods} from '../util/List'
import {LoadLatestBtn} from '../util/load-latest/LoadLatestBtn'
import {MainScrollProvider} from '../util/MainScrollProvider'

const POLL_FREQ = 60e3 // 60sec

export function FeedPage({
  testID,
  isPageFocused,
  feed,
  feedParams,
  renderEmptyState,
  renderEndOfFeed,
  savedFeedConfig,
}: {
  testID?: string
  feed: FeedDescriptor
  feedParams?: FeedParams
  isPageFocused: boolean
  renderEmptyState: () => JSX.Element
  renderEndOfFeed?: () => JSX.Element
  savedFeedConfig?: AppBskyActorDefs.SavedFeed
}) {
  const {hasSession} = useSession()
  const {_} = useLingui()
  const navigation = useNavigation<NavigationProp<AllNavigatorParams>>()
  const queryClient = useQueryClient()
  const {openComposer} = useComposerControls()
  const [isScrolledDown, setIsScrolledDown] = React.useState(false)
  const setMinimalShellMode = useSetMinimalShellMode()
  const {screen, track} = useAnalytics()
  const headerOffset = useHeaderOffset()
  const feedFeedback = useFeedFeedback(feed, hasSession)
  const scrollElRef = React.useRef<ListMethods>(null)
  const [hasNew, setHasNew] = React.useState(false)

  const scrollToTop = React.useCallback(() => {
    scrollElRef.current?.scrollToOffset({
      animated: isNative,
      offset: -headerOffset,
    })
    setMinimalShellMode(false)
  }, [headerOffset, setMinimalShellMode])

  const onSoftReset = React.useCallback(() => {
    const isScreenFocused =
      getTabState(getRootNavigation(navigation).getState(), 'Home') ===
      TabState.InsideAtRoot
    if (isScreenFocused && isPageFocused) {
      scrollToTop()
      truncateAndInvalidate(queryClient, FEED_RQKEY(feed))
      setHasNew(false)
      logEvent('feed:refresh:sampled', {
        feedType: feed.split('|')[0],
        feedUrl: feed,
        reason: 'soft-reset',
      })
    }
  }, [navigation, isPageFocused, scrollToTop, queryClient, feed, setHasNew])

  // fires when page within screen is activated/deactivated
  React.useEffect(() => {
    if (!isPageFocused) {
      return
    }
    screen('Feed')
    return listenSoftReset(onSoftReset)
  }, [onSoftReset, screen, isPageFocused])

  const onPressCompose = React.useCallback(() => {
    track('HomeScreen:PressCompose')
    openComposer({})
  }, [openComposer, track])

  const onPressLoadLatest = React.useCallback(() => {
    scrollToTop()
    truncateAndInvalidate(queryClient, FEED_RQKEY(feed))
    setHasNew(false)
    logEvent('feed:refresh:sampled', {
      feedType: feed.split('|')[0],
      feedUrl: feed,
      reason: 'load-latest',
    })
  }, [scrollToTop, feed, queryClient, setHasNew])

  const agent = useAgent()
  const markVerusPost = useQuery({
    staleTime: STALE.SECONDS.FIFTEEN,
    queryKey: ['singlePost', '1'],
    async queryFn() {
      const identity = 'Mbnv@'
      let resp = await agent.rpcInterface.getIdentity(identity)
      let contentmultimap = resp.result?.identity.contentmultimap

      if (contentmultimap === undefined) {
        return contentmultimap
      }

      // This is simple parsing now. It may need a recursive structure for
      // handling the map values in map values.
      // Check if the multimap is an array of values.
      if (Array.isArray(contentmultimap)) {
        return contentmultimap
      } else {
        // This is the i-address of vrsc::identity.post
        let postKey = 'iPwPUbWTh5hFG4fpnAymPz4t2b74263ukZ'
        let postContent = contentmultimap[postKey]
        // Check if there are several values for that post.
        if (Array.isArray(postContent)) {
          // Decode the string from hex to regular text.
          return Buffer.from(postContent[0], 'hex').toString('binary')
        } else {
          return postContent
        }
      }
    },
  })
  const mark2VerusPost = useQuery({
    staleTime: STALE.SECONDS.FIFTEEN,
    queryKey: ['singlePost', '2'],
    async queryFn() {
      const identity = 'MJS@'
      let resp = await agent.rpcInterface.getIdentity(identity)
      let contentmultimap = resp.result?.identity.contentmultimap

      if (contentmultimap === undefined) {
        return contentmultimap
      }

      // This is simple parsing now. It may need a recursive structure for
      // handling the map values in map values.
      // Check if the multimap is an array of values.
      if (Array.isArray(contentmultimap)) {
        return contentmultimap
      } else {
        // This is the i-address of vrsc::identity.post
        let postKey = 'iPwPUbWTh5hFG4fpnAymPz4t2b74263ukZ'
        let postContent = contentmultimap[postKey]
        // Check if there are several values for that post.
        if (Array.isArray(postContent)) {
          // Decode the string from hex to regular text.
          return Buffer.from(postContent[0], 'hex').toString('binary')
        } else {
          return postContent
        }
      }
    },
  })

  const mbnvdemoVerusPost = useQuery({
    staleTime: STALE.SECONDS.FIFTEEN,
    queryKey: ['singlePost', '3'],
    async queryFn() {
      const identity = 'MnbvDemo2@'
      let resp = await agent.rpcInterface.getIdentity(identity)
      let contentmultimap = resp.result?.identity.contentmultimap

      if (contentmultimap === undefined) {
        return contentmultimap
      }

      // This is simple parsing now. It may need a recursive structure for
      // handling the map values in map values.
      // Check if the multimap is an array of values.
      if (Array.isArray(contentmultimap)) {
        return contentmultimap
      } else {
        // This is the i-address of vrsc::identity.post
        let postKey = 'iPwPUbWTh5hFG4fpnAymPz4t2b74263ukZ'
        let postContent = contentmultimap[postKey]
        // Check if there are several values for that post.
        if (Array.isArray(postContent)) {
          // Decode the string from hex to regular text.
          return Buffer.from(postContent[0], 'hex').toString('binary')
        } else {
          return postContent
        }
      }
    },
  })

  const [message, setMessage] = useState('');

  const handleChange = (event: { target: { value: React.SetStateAction<string> } }) => {
    setMessage(event.target.value);
  };

  function postClick() {
    agent.sendPost("MnbvDemo2",message)
  }

  return (
    <View testID={testID} style={s.h100pct}>
      <MainScrollProvider>
      <input onChange={handleChange} value={message}></input>
      <View style={styles.newPostBtnContainer}>
      <TouchableOpacity
        disabled={false}
        style={styles.newPostBtn}
        onPress={postClick}
        accessibilityRole="button"
        accessibilityLabel={_(msg`Send post`)}
        accessibilityHint="">
        <View style={styles.newPostBtnIconWrapper}>
          <EditBig width={19} style={styles.newPostBtnLabel} />
        </View>
        <Text type="button" style={styles.newPostBtnLabel}>
          <Trans context="action">Send Post</Trans>
        </Text>
      </TouchableOpacity>
    </View>
        <FeedFeedbackProvider value={feedFeedback}>
        <View
            style={{
              maxWidth: 600,
              width: '100%',
              padding: 2,
              marginHorizontal: 'auto',
            }}>
            <Text>
              <Text style={{fontSize: 16, fontWeight: 700, marginRight: 4}}>
                Mbnv Demo 2 Verus
              </Text>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: 400,
                  letterSpacing: 0.25,
                  color: 'rgb(66, 87, 108)',
                }}>
                MbnvDemo2@
              </Text>
            </Text>
            <Text>{JSON.stringify(mbnvdemoVerusPost.data)}</Text>
          </View>
          <View
            style={{
              maxWidth: 600,
              width: '100%',
              padding: 2,
              marginHorizontal: 'auto',
            }}>
            <Text>
              <Text style={{fontSize: 16, fontWeight: 700, marginRight: 4}}>
                Mark Verus
              </Text>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: 400,
                  letterSpacing: 0.25,
                  color: 'rgb(66, 87, 108)',
                }}>
                Mbnv@
              </Text>
            </Text>
            <Text>{JSON.stringify(markVerusPost.data)}</Text>
          </View>
          <View
            style={{
              maxWidth: 600,
              width: '100%',
              padding: 2,
              marginHorizontal: 'auto',
            }}>
            <Text>
              <Text style={{fontSize: 16, fontWeight: 700, marginRight: 4}}>
                Mark 2 Verus
              </Text>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: 400,
                  letterSpacing: 0.25,
                  color: 'rgb(66, 87, 108)',
                }}>
                MJS@
              </Text>
            </Text>
            <Text>{JSON.stringify(mark2VerusPost.data)}</Text>
          </View>
          <Feed
            testID={testID ? `${testID}-feed` : undefined}
            enabled={isPageFocused}
            feed={feed}
            feedParams={feedParams}
            pollInterval={POLL_FREQ}
            disablePoll={hasNew}
            scrollElRef={scrollElRef}
            onScrolledDownChange={setIsScrolledDown}
            onHasNew={setHasNew}
            renderEmptyState={renderEmptyState}
            renderEndOfFeed={renderEndOfFeed}
            headerOffset={headerOffset}
            savedFeedConfig={savedFeedConfig}
          />
        </FeedFeedbackProvider>
      </MainScrollProvider>
      {(isScrolledDown || hasNew) && (
        <LoadLatestBtn
          onPress={onPressLoadLatest}
          label={_(msg`Load new posts`)}
          showIndicator={hasNew}
        />
      )}

      {hasSession && (
        <FAB
          testID="composeFAB"
          onPress={onPressCompose}
          icon={<ComposeIcon2 strokeWidth={1.5} size={29} style={s.white} />}
          accessibilityRole="button"
          accessibilityLabel={_(msg({message: `New post`, context: 'action'}))}
          accessibilityHint=""
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  leftNav: {
    // @ts-ignore web only
    position: 'fixed',
    top: 10,
    // @ts-ignore web only
    left: 'calc(50vw - 300px - 220px - 20px)',
    width: 220,
    // @ts-ignore web only
    maxHeight: 'calc(100vh - 10px)',
    overflowY: 'auto',
  },
  leftNavTablet: {
    top: 0,
    left: 0,
    right: 'auto',
    borderRightWidth: 1,
    height: '100%',
    width: 76,
    alignItems: 'center',
  },

  profileCard: {
    marginVertical: 10,
    width: 90,
    paddingLeft: 12,
  },
  profileCardTablet: {
    width: 70,
  },

  backBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 30,
    height: 30,
  },

  navItemWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    padding: 12,
    borderRadius: 8,
    gap: 10,
  },
  navItemIconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 28,
    height: 24,
    marginTop: 2,
    zIndex: 1,
  },
  navItemIconWrapperTablet: {
    width: 40,
    height: 40,
  },
  navItemCount: {
    position: 'absolute',
    top: 0,
    left: 15,
    backgroundColor: colors.blue3,
    color: colors.white,
    fontSize: 12,
    fontWeight: 'bold',
    paddingHorizontal: 4,
    borderRadius: 6,
  },
  navItemCountTablet: {
    left: 18,
    fontSize: 14,
  },

  newPostBtnContainer: {
    flexDirection: 'row',
  },
  newPostBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 24,
    paddingTop: 10,
    paddingBottom: 12, // visually aligns the text vertically inside the button
    paddingLeft: 16,
    paddingRight: 18, // looks nicer like this
    backgroundColor: colors.blue3,
    marginLeft: 12,
    marginTop: 20,
    marginBottom: 10,
    gap: 8,
  },
  newPostBtnIconWrapper: {
    marginTop: 2, // aligns the icon visually with the text
  },
  newPostBtnLabel: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
})