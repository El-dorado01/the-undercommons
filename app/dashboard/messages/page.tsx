'use client';

import { useState, useEffect } from 'react';
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
  const { user, isAuthenticated } = useAuth();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<'giver' | 'seeker'>('giver');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<
    string | null
  >(null);
  const [isLoading, setIsLoading] = useState(true);
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'seeker' || tabParam === 'giver') {
      setActiveTab(tabParam as 'giver' | 'seeker');
    }
  }, [searchParams]);

  useEffect(() => {
    fetchConversations();
  }, [activeTab]);

  const fetchConversations = async () => {
    if (!isAuthenticated) return;

    setIsLoading(true);
    try {
      const currentUserId = (user as any)?.data?.data?.id?.uuid;
      console.log('Current User ID:', currentUserId);

      if (!currentUserId) {
        setConversations([]);
        setIsLoading(false);
        return;
      }

      // Fetch transactions based on role
      // For Giver: I am the provider (selling/giving) -> look for 'sale'
      // For Seeker: I am the customer (buying/receiving) -> look for 'order'
      const queryParams = {
        only: activeTab === 'giver' ? 'sale' : 'order',
        include: ['listing', 'provider', 'customer', 'messages'],
        lastTransitions: ['transition/inquire'],
      };

      const response = await sharetribeSdk.transactions.query(
        queryParams as any,
      );

      const transactions = response?.data?.data || [];
      const included = response?.data?.included || [];

      // Build maps for listings and users
      const listingsMap = new Map();
      const usersMap = new Map();

      (included as any[]).forEach((item: any) => {
        if (item.type === 'listing') {
          listingsMap.set(item.id.uuid, item.attributes.title);
        }
        if (item.type === 'user') {
          const profile = item.attributes?.profile;
          const firstName = profile?.firstName || '';
          const lastName = profile?.lastName || '';
          const displayName =
            profile?.publicData?.displayName ||
            `${firstName} ${lastName}`.trim() ||
            'User';
          usersMap.set(item.id.uuid, displayName);
        }
      });

      // Transform transactions into conversations
      const convs: Conversation[] = transactions.map((tx: any) => {
        const listingId = tx.relationships?.listing?.data?.id?.uuid;
        const providerId = tx.relationships?.provider?.data?.id?.uuid;
        const customerId = tx.relationships?.customer?.data?.id?.uuid;

        // Determine the other party based on role
        const otherPartyId = activeTab === 'giver' ? customerId : providerId;

        // Get messages for this transaction
        const txMessages = (included as any[])
          .filter(
            (item: any) =>
              item.type === 'message' &&
              item.relationships?.transaction?.data?.id?.uuid === tx.id.uuid,
          )
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

        const lastMsg = txMessages[txMessages.length - 1];

        return {
          id: tx.id.uuid,
          listingId: listingId || '',
          listingTitle: listingsMap.get(listingId) || 'Unknown Listing',
          otherPartyId: otherPartyId || '',
          otherPartyName: usersMap.get(otherPartyId) || 'Unknown User',
          lastMessage: lastMsg?.content || 'No messages yet',
          lastMessageTime: lastMsg?.createdAt || tx.attributes.createdAt,
          unread: false,
          messages: txMessages,
        };
      });

      setConversations(convs);
    } catch (error: any) {
      console.error('Failed to fetch conversations:', error);
      toast.error('Failed to load messages');
      setConversations([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedConversation) return;

    try {
      await sharetribeSdk.messages.send({
        transactionId: new UUID(selectedConversation),
        content: messageInput.trim(),
      } as any);

      toast.success('Message sent');
      setMessageInput('');

      // Refresh conversations to show new message
      await fetchConversations();
    } catch (error: any) {
      console.error('Failed to send message:', error);
      toast.error('Failed to send message');
    }
  };

  const filteredConversations = conversations.filter(
    (conv) =>
      conv.listingTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.otherPartyName.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const selectedConv = conversations.find((c) => c.id === selectedConversation);

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
        onValueChange={(v) => setActiveTab(v as 'giver' | 'seeker')}
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
          <div className='grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-[500px] lg:h-[calc(100vh-350px)]'>
            {/* Conversations List */}
            <Card className='lg:col-span-1 h-[350px] lg:h-auto flex flex-col'>
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
              <CardContent className='p-0 flex-1 overflow-hidden'>
                <ScrollArea className='h-full'>
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
                              <p className='text-xs text-muted-foreground truncate mb-1'>
                                {conv.listingTitle}
                              </p>
                              <p className='text-xs text-muted-foreground truncate'>
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
            <Card className='lg:col-span-2 flex flex-col min-h-[450px] lg:h-auto'>
              {selectedConv ? (
                <>
                  <CardHeader className='border-b'>
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

                  <CardContent className='flex-1 p-4'>
                    <ScrollArea className='h-[250px] lg:h-[calc(100vh-600px)] pr-4'>
                      <div className='space-y-4'>
                        {selectedConv.messages.map((msg) => {
                          const isOwn =
                            msg.senderId ===
                            (user as any)?.data?.data?.id?.uuid;
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
                    </ScrollArea>
                  </CardContent>

                  <div className='border-t p-4'>
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
