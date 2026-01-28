'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/components/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { sharetribeSdk } from '@/lib/sharetribe';
import { toast } from 'sonner';
import {
  Loader2,
  Send,
  MessageSquare,
  User,
  Package,
  Search as SearchIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
// @ts-ignore
import * as SDK from 'sharetribe-flex-sdk';
const { types } = SDK as any;
const { UUID } = types;

interface Message {
  id: string;
  content: string;
  senderId: string;
  createdAt: string;
}

interface Conversation {
  id: string;
  listingId: string;
  listingTitle: string;
  otherPartyId: string;
  otherPartyName: string;
  lastMessage: string;
  lastMessageTime: string;
  unread: boolean;
  messages: Message[];
}

export default function MessagesPage() {
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<'giver' | 'seeker'>('giver');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<
    string | null
  >(null);
  const [isLoading, setIsLoading] = useState(true);
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [messageHistory, setMessageHistory] = useState<
    Record<string, Message[]>
  >({});
  const [isMessagesLoading, setIsMessagesLoading] = useState(false);

  const fetchIdRef = useRef(0);

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'seeker' || tabParam === 'giver') {
      if (tabParam !== activeTab) {
        setActiveTab(tabParam as 'giver' | 'seeker');
        setSelectedConversation(null); // Reset when switching tabs manually
      }
    }

    const idParam = searchParams.get('id');
    if (idParam && idParam !== selectedConversation) {
      setSelectedConversation(idParam);
    }
  }, [searchParams, activeTab, selectedConversation]);

  const fetchConversations = useCallback(
    async (tabToFetch: 'giver' | 'seeker') => {
      if (!isAuthenticated || isAuthLoading) return;

      const currentFetchId = ++fetchIdRef.current;
      setIsLoading(true);
      try {
        const currentUserId = (user as any)?.data?.data?.id?.uuid;

        if (!currentUserId) {
          if (currentFetchId === fetchIdRef.current) {
            setConversations([]);
            setIsLoading(false);
          }
          return;
        }

        // Fetch transactions based on role
        const queryParams = {
          only: tabToFetch === 'giver' ? 'sale' : 'order',
          include: [
            'listing',
            'provider',
            'customer',
            'messages',
            'lastMessage',
          ],
          lastTransitions: ['transition/inquire-without-payment'],
        };

        const response = await sharetribeSdk.transactions.query(
          queryParams as any,
        );

        // If a newer fetch has started, ignore this response
        if (currentFetchId !== fetchIdRef.current) return;

        const transactions = response?.data?.data || [];
        const included = response?.data?.included || [];

        // 1. Build a map of all included resources by ID for easy lookup
        const includedMap = new Map();
        (included as any[]).forEach((item: any) => {
          includedMap.set(item.id.uuid, item);
        });

        // 2. Prepare message history update
        const historyUpdate: Record<string, Message[]> = {};

        // Transform transactions into conversations
        const convs: Conversation[] = transactions.map((tx: any) => {
          const listingId = tx.relationships?.listing?.data?.id?.uuid;
          const providerId = tx.relationships?.provider?.data?.id?.uuid;
          const customerId = tx.relationships?.customer?.data?.id?.uuid;

          // Determine the other party based on role
          const otherPartyId = tabToFetch === 'giver' ? customerId : providerId;

          // Find messages for this transaction from relationships
          const txMsgRefs = tx.relationships?.messages?.data || [];
          const lastMsgRef = tx.relationships?.lastMessage?.data;

          const txMessages: Message[] = [];

          // Add all referenced messages that are in 'included'
          txMsgRefs.forEach((ref: any) => {
            const msgData = includedMap.get(ref.id.uuid);
            if (msgData && msgData.type === 'message') {
              txMessages.push({
                id: msgData.id.uuid,
                content: msgData.attributes.content,
                senderId: msgData.relationships?.sender?.data?.id?.uuid,
                createdAt: msgData.attributes.createdAt,
              });
            }
          });

          // Ensure lastMessage is included if it's not already in txMessages
          if (lastMsgRef) {
            const hasLastMsg = txMessages.some(
              (m) => m.id === lastMsgRef.id.uuid,
            );
            if (!hasLastMsg) {
              const msgData = includedMap.get(lastMsgRef.id.uuid);
              if (msgData && msgData.type === 'message') {
                txMessages.push({
                  id: msgData.id.uuid,
                  content: msgData.attributes.content,
                  senderId: msgData.relationships?.sender?.data?.id?.uuid,
                  createdAt: msgData.attributes.createdAt,
                });
              }
            }
          }

          // Sort messages by date
          txMessages.sort(
            (a, b) =>
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
          );

          if (txMessages.length > 0) {
            historyUpdate[tx.id.uuid] = txMessages;
          }

          const lastMsg = txMessages[txMessages.length - 1];
          const listing = includedMap.get(listingId);
          const otherParty = includedMap.get(otherPartyId);

          let otherPartyName = 'Unknown User';
          if (otherParty) {
            const profile = otherParty.attributes?.profile;
            const firstName = profile?.firstName || '';
            const lastName = profile?.lastName || '';
            otherPartyName =
              profile?.publicData?.displayName ||
              `${firstName} ${lastName}`.trim() ||
              'User';
          }

          return {
            id: tx.id.uuid,
            listingId: listingId || '',
            listingTitle: listing?.attributes?.title || 'Unknown Listing',
            otherPartyId: otherPartyId || '',
            otherPartyName,
            lastMessage: lastMsg?.content || 'No messages yet',
            lastMessageTime: lastMsg?.createdAt || tx.attributes.createdAt,
            unread: false,
            messages: txMessages,
          };
        });

        setMessageHistory((prev) => ({
          ...prev,
          ...historyUpdate,
        }));

        setConversations(convs);
      } catch (error: any) {
        if (currentFetchId === fetchIdRef.current) {
          console.error('Failed to fetch conversations:', error);
          toast.error('Failed to load messages');
          setConversations([]);
        }
      } finally {
        if (currentFetchId === fetchIdRef.current) {
          setIsLoading(false);
        }
      }
    },
    [isAuthenticated, isAuthLoading, user],
  );

  useEffect(() => {
    if (isAuthenticated && !isAuthLoading) {
      fetchConversations(activeTab);
    }
  }, [activeTab, isAuthenticated, isAuthLoading, fetchConversations]);

  const fetchMessages = useCallback(
    async (transactionId: string) => {
      if (!isAuthenticated || isAuthLoading) return;

      setIsMessagesLoading(true);
      try {
        const response = await sharetribeSdk.messages.query({
          transactionId: new UUID(transactionId),
          include: ['sender'],
        } as any);

        const messages = (response?.data?.data || [])
          .map((msg: any) => ({
            id: msg.id.uuid,
            content: msg.attributes.content,
            senderId: msg.relationships?.sender?.data?.id?.uuid,
            createdAt: msg.attributes.createdAt,
          }))
          .sort(
            (a: Message, b: Message) =>
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
          );

        setMessageHistory((prev) => ({
          ...prev,
          [transactionId]: messages,
        }));
      } catch (error) {
        console.error('Failed to fetch messages:', error);
      } finally {
        setIsMessagesLoading(false);
      }
    },
    [isAuthenticated, isAuthLoading],
  );

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation);
    }
  }, [selectedConversation, fetchMessages]);

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedConversation) return;

    try {
      await sharetribeSdk.messages.send({
        transactionId: new UUID(selectedConversation),
        content: messageInput.trim(),
      } as any);

      toast.success('Message sent');
      setMessageInput('');

      // Refresh both conversation list and specific thread messages
      await Promise.all([
        fetchConversations(activeTab),
        fetchMessages(selectedConversation),
      ]);
    } catch (error: any) {
      console.error('Failed to send message:', error);
      toast.error('Failed to send message');
    }
  };

  const conversationsWithHistory = conversations.map((conv) => {
    const history = messageHistory[conv.id];
    if (history && history.length > 0) {
      const lastMsg = history[history.length - 1];
      return {
        ...conv,
        lastMessage: lastMsg.content,
        lastMessageTime: lastMsg.createdAt,
      };
    }
    return conv;
  });

  const filteredConversations = conversationsWithHistory.filter(
    (conv) =>
      conv.listingTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.otherPartyName.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const selectedConv = conversationsWithHistory.find(
    (c) => c.id === selectedConversation,
  );
  const currentMessages = selectedConversation
    ? messageHistory[selectedConversation] || selectedConv?.messages || []
    : [];

  return (
    <div className='w-full py-6 flex flex-col gap-6'>
      {/* Header */}
      <div>
        <h1 className='text-3xl font-bold tracking-tight'>Messages</h1>
        <p className='text-muted-foreground'>
          Manage your conversations with community members
        </p>
      </div>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={(v) => {
          setActiveTab(v as 'giver' | 'seeker');
          setSelectedConversation(null); // Reset when switching tabs
        }}
      >
        <TabsList className='grid w-full max-w-md grid-cols-2'>
          <TabsTrigger
            value='giver'
            className='gap-2'
          >
            <Package className='w-4 h-4' />
            As Giver
          </TabsTrigger>
          <TabsTrigger
            value='seeker'
            className='gap-2'
          >
            <SearchIcon className='w-4 h-4' />
            As Seeker
          </TabsTrigger>
        </TabsList>

        <TabsContent
          value={activeTab}
          className='mt-6'
        >
          <div className='grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-280px)] min-h-[600px]'>
            {/* Conversations List */}
            <Card className='lg:col-span-1 flex flex-col overflow-hidden h-[400px] lg:h-full'>
              <CardHeader className='pb-3 shrink-0'>
                <CardTitle className='text-lg'>Conversations</CardTitle>
                <div className='relative mt-2'>
                  <SearchIcon className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground' />
                  <Input
                    placeholder='Search conversations...'
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className='pl-10'
                  />
                </div>
              </CardHeader>
              <CardContent className='p-0 flex-1 min-h-0 overflow-hidden'>
                <ScrollArea className='h-full scrollbar-visible'>
                  {isLoading ? (
                    <div className='flex items-center justify-center py-12'>
                      <Loader2 className='w-6 h-6 animate-spin text-primary' />
                    </div>
                  ) : filteredConversations.length === 0 ? (
                    <div className='flex flex-col items-center justify-center py-12 px-4 text-center'>
                      <MessageSquare className='w-12 h-12 text-muted-foreground mb-3' />
                      <p className='text-sm font-medium'>
                        No conversations yet
                      </p>
                      <p className='text-xs text-muted-foreground mt-1'>
                        {activeTab === 'giver'
                          ? 'Messages about your offerings will appear here'
                          : 'Your inquiries will appear here'}
                      </p>
                    </div>
                  ) : (
                    <div className='divide-y'>
                      {filteredConversations.map((conv) => (
                        <button
                          key={conv.id}
                          onClick={() => setSelectedConversation(conv.id)}
                          className={cn(
                            'w-full p-4 text-left hover:bg-muted/50 transition-colors',
                            selectedConversation === conv.id && 'bg-muted',
                          )}
                        >
                          <div className='flex items-start gap-3'>
                            <Avatar className='w-10 h-10'>
                              <AvatarFallback>
                                {conv.otherPartyName[0].toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className='flex-1 min-w-0'>
                              <div className='flex items-center justify-between gap-2 mb-1'>
                                <p className='font-medium text-sm truncate'>
                                  {conv.otherPartyName}
                                </p>
                                {conv.unread && (
                                  <Badge
                                    variant='default'
                                    className='h-5 px-1.5 text-xs'
                                  >
                                    New
                                  </Badge>
                                )}
                              </div>
                              <p className='text-xs text-muted-foreground line-clamp-1 mb-1'>
                                {conv.listingTitle}
                              </p>
                              <p className='text-xs text-muted-foreground line-clamp-1'>
                                {conv.lastMessage}
                              </p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Message Thread */}
            <Card className='lg:col-span-2 flex flex-col overflow-hidden h-full min-h-[500px] lg:min-h-0'>
              {selectedConv ? (
                <>
                  <CardHeader className='border-b shrink-0'>
                    <div className='flex items-center gap-3'>
                      <Avatar>
                        <AvatarFallback>
                          {selectedConv.otherPartyName[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className='text-lg'>
                          {selectedConv.otherPartyName}
                        </CardTitle>
                        <p className='text-sm text-muted-foreground'>
                          {selectedConv.listingTitle}
                        </p>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className='flex-1 min-h-0 p-0 overflow-hidden'>
                    <ScrollArea className='h-full p-4 scrollbar-visible'>
                      {isMessagesLoading && currentMessages.length === 0 ? (
                        <div className='flex items-center justify-center h-full'>
                          <Loader2 className='w-6 h-6 animate-spin text-primary' />
                        </div>
                      ) : (
                        <div className='space-y-4'>
                          {currentMessages.map((msg) => {
                            const isOwn =
                              msg.senderId === (user as any)?.data?.data?.id?.uuid;
                            return (
                              <div
                                key={msg.id}
                                className={cn(
                                  'flex',
                                  isOwn ? 'justify-end' : 'justify-start',
                                )}
                              >
                                <div
                                  className={cn(
                                    'max-w-[70%] rounded-lg px-4 py-2',
                                    isOwn
                                      ? 'bg-primary text-primary-foreground'
                                      : 'bg-muted',
                                  )}
                                >
                                  <p className='text-sm'>{msg.content}</p>
                                  <p
                                    className={cn(
                                      'text-xs mt-1',
                                      isOwn
                                        ? 'text-primary-foreground/70'
                                        : 'text-muted-foreground',
                                    )}
                                  >
                                    {new Date(msg.createdAt).toLocaleTimeString(
                                      [],
                                      {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                      },
                                    )}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </ScrollArea>
                  </CardContent>

                  <div className='border-t p-4 shrink-0'>
                    <div className='flex gap-2'>
                      <Input
                        placeholder='Type your message...'
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        onKeyPress={(e) =>
                          e.key === 'Enter' && handleSendMessage()
                        }
                      />
                      <Button
                        onClick={handleSendMessage}
                        disabled={!messageInput.trim()}
                      >
                        <Send className='w-4 h-4' />
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className='flex-1 flex items-center justify-center'>
                  <div className='text-center'>
                    <MessageSquare className='w-16 h-16 text-muted-foreground mx-auto mb-4' />
                    <p className='text-lg font-medium'>Select a conversation</p>
                    <p className='text-sm text-muted-foreground mt-1'>
                      Choose a conversation from the list to view messages
                    </p>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
